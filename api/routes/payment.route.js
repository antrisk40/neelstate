import express from 'express';
import verifyToken from '../utils/verifyUser.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPurchasedListings,
  getSoldListings,
  refundPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Create payment intent for a listing
router.post('/create-payment-intent/:listingId', verifyToken, createPaymentIntent);

// Confirm payment and complete purchase
router.post('/confirm-payment/:paymentIntentId', verifyToken, confirmPayment);

// Get user's purchased listings
router.get('/purchased-listings/:userId', verifyToken, getPurchasedListings);

// Get seller's sold listings
router.get('/sold-listings/:userId', verifyToken, getSoldListings);

// Refund payment
router.post('/refund/:listingId', verifyToken, refundPayment);

export default router; 