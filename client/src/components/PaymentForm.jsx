import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { addCsrfHeader } from '../utils/csrf';

export default function PaymentForm({ listing, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(listing?.regularPrice || 0);

  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useSelector((state) => state.user);

  const handleCreatePaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json'
        }),
        credentials: 'include',
        body: JSON.stringify({
          listingId: listing._id,
          amount: amount,
          currency: 'usd',
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Failed to create payment intent');
        return;
      }
      setClientSecret(data.clientSecret);
      setTransactionId(data.transactionId);
    } catch (error) {
      setError('Failed to create payment intent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setLoading(false);
      return;
    }
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });
    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }
    if (paymentIntent.status === 'succeeded') {
      onSuccess && onSuccess(paymentIntent);
    } else {
      setError('Payment failed!');
    }
    setLoading(false);
  };

  if (!listing) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <p className="text-red-500">No listing selected for payment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-emerald-800 mb-4">Complete Payment</h3>
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Property Details</h4>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="font-medium">{listing.name}</p>
          <p className="text-sm text-gray-600">{listing.address}</p>
          <p className="text-sm text-gray-600">
            {listing.bedrooms} bed, {listing.bathrooms} bath
          </p>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Amount (USD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500"
          placeholder="Enter amount"
        />
      </div>
      {!clientSecret ? (
        <button
          onClick={handleCreatePaymentIntent}
          disabled={loading || amount <= 0}
          className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Processing...' : `Pay $${amount}`}
        </button>
      ) : (
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              Payment intent created. Please complete your payment.
            </p>
          </div>
          <CardElement />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Processing Payment...' : 'Complete Payment'}
          </button>
        </form>
      )}
      <button
        onClick={onCancel}
        disabled={loading}
        className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 mt-2"
      >
        Cancel
      </button>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 Your payment is secured with SSL encryption</p>
        <p>💳 We accept all major credit cards</p>
      </div>
    </div>
  );
} 