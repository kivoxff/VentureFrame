import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { orderId } = useSelector((state) => state.checkout);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe redirects here automatically after successful auth
        return_url: `http://localhost:5173/checkout?step=success&orderId=${orderId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <button
        disabled={isProcessing || !stripe}
        className="w-full p-3 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-600 disabled:bg-gray-400"
      >
        {isProcessing ? "Processing Payment..." : "Complete Purchase"}
      </button>
    </form>
  );
};

function Payment() {
  // Pull secret from Redux
  const { clientSecret } = useSelector((state) => state.checkout);

  // Guard: If no secret exists, they haven't submitted the shipping form
  if (!clientSecret) {
    return <Navigate to="/checkout?step=shipping" replace />;
  }

  return (
    <div className="w-full max-w-lg mx-auto p-8 border rounded-3xl bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Secure Payment</h2>
      <p className="text-gray-500 mb-8 text-sm">
        All transactions are secure and encrypted.
      </p>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

export default Payment;
