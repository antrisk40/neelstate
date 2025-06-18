# Environment Setup Guide

## Quick Setup

To fix the Stripe error and get your app running, follow these steps:

### 1. Create Environment File

Create a `.env` file in the `client` directory with the following content:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Mapbox Configuration  
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### 2. Get Your Stripe Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign up or log in to your Stripe account
3. Navigate to "Developers" → "API keys"
4. Copy your "Publishable key" (starts with `pk_test_` for test mode)
5. Replace `pk_test_your_stripe_publishable_key_here` in your `.env` file with your actual key

### 3. Get Your Mapbox Token (Optional)

1. Go to [Mapbox](https://account.mapbox.com/access-tokens/)
2. Sign up or log in to your Mapbox account
3. Copy your access token
4. Replace `your_mapbox_access_token_here` in your `.env` file with your actual token

### 4. Restart Your Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Test Mode vs Live Mode

- **For Development**: Use test keys (start with `pk_test_`)
- **For Production**: Use live keys (start with `pk_live_`) - only after thorough testing

## Test Card Numbers

For testing payments, use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Troubleshooting

### "Cannot read properties of undefined (reading 'match')"
This error occurs when Stripe is not properly configured. Make sure:
1. Your `.env` file exists in the `client` directory
2. The `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
3. You've restarted the development server after adding the environment variable

### Payment Form Not Loading
- Check that your Stripe key starts with `pk_test_` or `pk_live_`
- Verify the key is valid in your Stripe dashboard
- Check the browser console for any additional error messages

### Map Not Displaying
- Ensure your Mapbox access token is set correctly
- Check that the listing has latitude and longitude coordinates
- Verify your Mapbox account has sufficient quota 