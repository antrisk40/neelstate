import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PaymentForm = ({ listing, onSuccess, onError }) => {
  const [stripeError, setStripeError] = useState(null);
  const [stripeComponents, setStripeComponents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
          setStripeError('Payment system is not configured. Please contact support.');
          setLoading(false);
          return;
        }

        // Dynamically import Stripe components
        const [loadStripe, { Elements, CardElement, useStripe, useElements }] = await Promise.all([
          import('@stripe/stripe-js').then(module => module.loadStripe),
          import('@stripe/react-stripe-js').then(module => ({
            Elements: module.Elements,
            CardElement: module.CardElement,
            useStripe: module.useStripe,
            useElements: module.useElements,
          }))
        ]);

        const stripePromise = loadStripe(publishableKey);
        setStripeComponents({ Elements, CardElement, useStripe, useElements, stripePromise });
        setLoading(false);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        setStripeError('Payment system failed to load. Please try again later.');
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
          <p className="font-semibold">Payment System Loading...</p>
          <p className="text-sm">Please wait while we initialize the payment system.</p>
        </div>
      </div>
    );
  }

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

  if (!stripeComponents) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Payment System Error</p>
          <p>Unable to load payment system. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { Elements, CardElement, useStripe, useElements, stripePromise } = stripeComponents;

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
      } catch (error) {
        console.error('Payment error:', error);
        setError(error.message);
        onError(error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement
              options={{
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
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay $${listing.offer ? listing.discountPrice : listing.regularPrice}`}
        </button>
      </form>
    );
  };

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