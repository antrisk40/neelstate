import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Load Stripe with error handling
const getStripePromise = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('Stripe publishable key not found. Payment functionality will be disabled.');
    return null;
  }
  
  try {
    return loadStripe(publishableKey);
  } catch (error) {
    console.error('Failed to load Stripe:', error);
    return null;
  }
};

const stripePromise = getStripePromise();

const CheckoutForm = ({ listing, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const paymentIntentRes = await fetch(`/api/payment/create-payment-intent/${listing._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id,
        }),
      });

      const paymentIntentData = await paymentIntentRes.json();

      if (!paymentIntentRes.ok) {
        throw new Error(paymentIntentData.message || 'Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmRes = await fetch(`/api/payment/confirm-payment/${paymentIntent.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser._id,
          }),
        });

        const confirmData = await confirmRes.json();

        if (!confirmRes.ok) {
          throw new Error(confirmData.message || 'Failed to confirm payment');
        }

        onSuccess();
        navigate('/purchased-listings');
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="border rounded-lg p-4">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Order Summary</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Property:</span>
            <span>{listing.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Price:</span>
            <span>${listing.offer ? listing.discountPrice : listing.regularPrice}</span>
          </div>
          {listing.offer && (
            <div className="flex justify-between text-green-600 mb-2">
              <span>Discount:</span>
              <span>-${listing.regularPrice - listing.discountPrice}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>${listing.offer ? listing.discountPrice : listing.regularPrice}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay $${listing.offer ? listing.discountPrice : listing.regularPrice}`}
      </button>
    </form>
  );
};

const PaymentForm = ({ listing, onSuccess, onError }) => {
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    if (!stripePromise) {
      setStripeError('Payment system is not configured. Please contact support.');
    }
  }, []);

  if (stripeError) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-semibold">Payment Unavailable</p>
          <p>{stripeError}</p>
          <p className="mt-2 text-sm">
            Please contact the seller directly or try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
          <p className="font-semibold">Payment System Loading...</p>
          <p className="text-sm">Please wait while we initialize the payment system.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        listing={listing} 
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  );
};

export default PaymentForm; 