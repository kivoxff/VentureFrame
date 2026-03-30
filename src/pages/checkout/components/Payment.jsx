import  { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ==========================================
// 1. INITIALIZE STRIPE (Outside components)
// ==========================================
// Using Vite's import.meta.env for the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ==========================================
// 2. THE FORM COMPONENT (Handles the actual paying)
// ==========================================
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // This is where Stripe sends the user after a successful payment!
        // We set this to your specific success page route.
        return_url: "http://localhost:5173/checkout",
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* This renders the secure credit card fields */}
      <PaymentElement />

      <button
        disabled={!stripe || isProcessing}
        className="w-full mt-4 p-3 bg-violet-700 hover:bg-violet-600 rounded-xl text-white font-bold disabled:opacity-50 transition-colors"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>

      {errorMessage && (
        <div className="text-red-500 text-sm font-medium mt-2">
          {errorMessage}
        </div>
      )}
    </form>
  );
}

// ==========================================
// 3. THE MAIN PAGE EXPORT (Handles the layout & context)
// ==========================================
function Payment() {
  const [searchParams] = useSearchParams();
  const clientSecret = searchParams.get("secret");

  // if (!clientSecret) {
  //   return (
  //     <div className="flex justify-center items-center h-[50vh]">
  //       <p className="text-xl font-semibold text-gray-500 animate-pulse">
  //         Loading secure payment gateway...
  //       </p>
  //     </div>
  //   );
  // }

  const options = {
    clientSecret: clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#6d28d9", // Tailwind's violet-700 to match your theme
        borderRadius: "12px",
      },
    },
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 sm:border sm:rounded-2xl sm:shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Complete your payment
      </h2>

      {/* We wrap the CheckoutForm inside the Elements provider here */}
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

export default Payment;
