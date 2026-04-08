import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setPaymentMethod,
  setPaymentSession,
} from "../../../redux/checkout/checkoutSlice";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase/config";

function ShippingDetails() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { checkoutItems, paymentMethod, appliedCoupon } = useSelector(
    (state) => state.checkout,
  );

  const navigate = useNavigate();

  const handlePaymentChange = (method) => {
    dispatch(setPaymentMethod(method));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return alert("Cart is empty");

    setIsSubmitting(true);
    try {
      const createOrder = httpsCallable(functions, "createOrder");

      const response = await createOrder({
        products: checkoutItems.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon,
      });

      const { orderId, clientSecret } = response.data;

      // Save to Redux for the next step
      dispatch(
        setPaymentSession({ orderId, clientSecret: clientSecret || null }),
      );

      if (paymentMethod === "COD") {
        navigate(`/checkout?step=success`);
      } else {
        navigate(`/checkout?step=payment`);
      }
    } catch (error) {
      console.error("Order Creation Failed:", error);
      alert(error.message || "Failed to process order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full sm:flex-1 flex flex-col h-fit gap-3"
    >
      <fieldset className="w-full flex gap-2">
        <input
          type="text"
          placeholder="First Name"
          className="w-full p-2 border rounded-xl"
        />
        <input
          type="text"
          placeholder="Last Name"
          className="w-full p-2 border rounded-xl"
        />
      </fieldset>

      <input
        type="email"
        placeholder="Enter Your Email"
        className="w-full p-2 border rounded-xl"
      />
      <textarea
        type="text"
        placeholder="Street Address"
        className="w-full h-28 p-2 border rounded-xl"
      />

      <fieldset className="w-full flex gap-2">
        <input
          type="text"
          placeholder="City"
          className="w-full p-2 border rounded-xl"
        />
        <input
          type="text"
          placeholder="PIN Code"
          className="w-full p-2 border rounded-xl"
        />
      </fieldset>

      <fieldset className="flex flex-wrap gap-4">
        <label className="flex">
          <input
            type="radio"
            name="pay"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={() => handlePaymentChange("COD")}
          />
          <span className="ml-2 text-nowrap">Cash On Delivary</span>
        </label>

        <label className="flex">
          <input
            type="radio"
            name="pay"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            onChange={() => handlePaymentChange("ONLINE")}
          />
          <span className="ml-2 text-nowrap">UPI / Card / Netbanking</span>
        </label>
      </fieldset>

      <button
        type="submit"
        className="w-full p-2 bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl"
      >
        {isSubmitting
          ? "Creating Order..."
          : paymentMethod === "COD"
            ? "Place Order"
            : "Continue to Payment"}
      </button>
    </form>
  );
}

export default ShippingDetails;
