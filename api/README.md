# NeelState API

Backend API for the NeelState real estate application.

## Features

- User authentication and authorization
- Property listing management
- **Stripe payment processing**
- **Purchase and sales tracking**
- **Refund processing**
- MongoDB database integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB connection string
MONGODB_URI=your_mongodb_connection_string

# JWT secret for authentication
JWT_SECRET=your_jwt_secret

# Stripe secret key for payment processing
STRIPE_SECRET_KEY=your_stripe_secret_key
```

3. Get required API keys:
- **MongoDB**: Set up a MongoDB database and get your connection string
- **JWT**: Generate a secure random string for JWT signing
- **Stripe**: Get your secret key from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

4. Run the development server:
```bash
npm run dev
```

## Stripe Setup

### Getting Your Stripe Keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign up or log in to your Stripe account
3. Navigate to "Developers" → "API keys"
4. Copy your "Secret key" (starts with `sk_test_` for test mode or `sk_live_` for live mode)
5. Add it to your `.env` file as `STRIPE_SECRET_KEY`

### Test Mode vs Live Mode:
- **Test Mode**: Use `sk_test_` keys for development and testing
- **Live Mode**: Use `sk_live_` keys for production (only after thorough testing)

### Test Card Numbers:
For testing payments, you can use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Payment Integration

The API includes comprehensive Stripe payment processing:

### Endpoints:
- `POST /api/payment/create-payment-intent/:listingId` - Create payment intent for a listing
- `POST /api/payment/confirm-payment/:paymentIntentId` - Confirm payment and complete purchase
- `GET /api/payment/purchased-listings/:userId` - Get user's purchased listings
- `GET /api/payment/sold-listings/:userId` - Get seller's sold listings
- `POST /api/payment/refund/:listingId` - Process refund for a sold listing

### Database Changes:
- **User Model**: Added `stripeCustomerId` and `purchasedListings` fields
- **Listing Model**: Added `isSold`, `buyerId`, `soldAt`, `stripePaymentIntentId`, and `paymentStatus` fields

### Security Features:
- Payment verification through Stripe
- User authorization for all payment operations
- Automatic customer creation in Stripe
- Secure payment intent handling

## Troubleshooting

### Common Issues:

1. **"Neither apiKey nor config.authenticator provided"**:
   - Make sure `STRIPE_SECRET_KEY` is set in your `.env` file
   - Check that the key starts with `sk_test_` or `sk_live_`
   - Restart the server after adding the environment variable

2. **"Payment service is currently unavailable"**:
   - Verify your Stripe secret key is correct
   - Check your internet connection
   - Ensure Stripe service is not down

3. **"MongoDB connection failed"**:
   - Verify your `MONGODB_URI` is correct
   - Check if your MongoDB instance is running
   - Ensure network connectivity to your database

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start development server with nodemon 