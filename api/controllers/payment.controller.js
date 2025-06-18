import Stripe from 'stripe';
import Listing from '../models/listing.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

// Initialize Stripe with proper error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not found in environment variables. Payment features will be disabled.');
    stripe = null;
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error.message);
  stripe = null;
}

// Create payment intent for a listing
export const createPaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) {
      return next(errorHandler(503, 'Payment service is currently unavailable. Please check your Stripe configuration.'));
    }

    const { listingId } = req.params;
    const { userId } = req.body;

    // Get the listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    // Check if listing is already sold
    if (listing.isSold) {
      return next(errorHandler(400, 'This listing has already been sold'));
    }

    // Check if user is trying to buy their own listing
    if (listing.userRef === userId) {
      return next(errorHandler(400, 'You cannot buy your own listing'));
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Calculate the price (use discount price if offer is available)
    const amount = listing.offer ? listing.discountPrice : listing.regularPrice;

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        listingId: listingId,
        userId: userId,
        listingName: listing.name,
      },
    });

    // Update listing with payment intent ID
    await Listing.findByIdAndUpdate(listingId, {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm payment and complete purchase
export const confirmPayment = async (req, res, next) => {
  try {
    if (!stripe) {
      return next(errorHandler(503, 'Payment service is currently unavailable. Please check your Stripe configuration.'));
    }

    const { paymentIntentId } = req.params;
    const { userId } = req.body;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return next(errorHandler(400, 'Payment not completed'));
    }

    // Get listing from metadata
    const listingId = paymentIntent.metadata.listingId;
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    // Check if listing is already sold
    if (listing.isSold) {
      return next(errorHandler(400, 'This listing has already been sold'));
    }

    // Update listing as sold
    await Listing.findByIdAndUpdate(listingId, {
      isSold: true,
      buyerId: userId,
      soldAt: new Date(),
      paymentStatus: 'completed',
    });

    // Add listing to user's purchased listings
    await User.findByIdAndUpdate(userId, {
      $push: { purchasedListings: listingId }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Purchase completed successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Get user's purchased listings
export const getPurchasedListings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('purchasedListings');
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    res.status(200).json(user.purchasedListings);
  } catch (error) {
    next(error);
  }
};

// Get seller's sold listings
export const getSoldListings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const soldListings = await Listing.find({
      userRef: userId,
      isSold: true,
    }).populate('buyerId', 'username email');

    res.status(200).json(soldListings);
  } catch (error) {
    next(error);
  }
};

// Refund payment
export const refundPayment = async (req, res, next) => {
  try {
    if (!stripe) {
      return next(errorHandler(503, 'Payment service is currently unavailable. Please check your Stripe configuration.'));
    }

    const { listingId } = req.params;
    const { userId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    // Check if user is the seller
    if (listing.userRef !== userId) {
      return next(errorHandler(401, 'You can only refund your own listings'));
    }

    // Check if listing is sold
    if (!listing.isSold) {
      return next(errorHandler(400, 'This listing has not been sold'));
    }

    // Process refund through Stripe
    if (listing.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: listing.stripePaymentIntentId,
      });

      // Update listing status
      await Listing.findByIdAndUpdate(listingId, {
        paymentStatus: 'refunded',
      });

      // Remove from buyer's purchased listings
      if (listing.buyerId) {
        await User.findByIdAndUpdate(listing.buyerId, {
          $pull: { purchasedListings: listingId }
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Refund processed successfully',
        refundId: refund.id 
      });
    } else {
      return next(errorHandler(400, 'No payment found for this listing'));
    }
  } catch (error) {
    next(error);
  }
}; 