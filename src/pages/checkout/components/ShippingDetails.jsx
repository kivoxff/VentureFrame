import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setPaymentMethod,
  setPaymentSession,
} from "../../../redux/checkout/checkoutSlice";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../firebase/config";
import { toast } from "react-toastify";

function ShippingDetails() {
  const emptyForm = {
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma@example.com",
    street: "12 MG Road",
    city: "Nagpur",
    pinCode: "440001",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { checkoutItems, paymentMethod, appliedCoupon } = useSelector(
    (state) => state.checkout,
  );

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (method) => {
    dispatch(setPaymentMethod(method));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return toast.error("Cart is empty");

    setIsSubmitting(true);

    try {
      const placeOrder = httpsCallable(functions, "createOrder");

      const response = await placeOrder({
        products: checkoutItems.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon,
        address: formData,
      });

      const { orderId, clientSecret } = response.data;

      const isCOD = paymentMethod === "COD";

      // Save to Redux for the next step
      dispatch(
        setPaymentSession({
          orderId,
          clientSecret: isCOD ? null : clientSecret,
        }),
      );

      const nextStep = isCOD ? `success&orderId=${orderId}` : "payment";

      navigate(`/checkout?step=${nextStep}`);
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
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          type="text"
          placeholder="First Name"
          className="w-full p-2 border rounded-xl"
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          type="text"
          placeholder="Last Name"
          className="w-full p-2 border rounded-xl"
        />
      </fieldset>

      <input
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        type="email"
        placeholder="Enter Your Email"
        className="w-full p-2 border rounded-xl"
      />
      <textarea
        name="street"
        value={formData.street}
        onChange={handleInputChange}
        type="text"
        placeholder="Street Address"
        className="w-full h-28 p-2 border rounded-xl"
      />

      <fieldset className="w-full flex gap-2">
        <input
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          type="text"
          placeholder="City"
          className="w-full p-2 border rounded-xl"
        />
        <input
          name="pinCode"
          value={formData.pinCode}
          onChange={handleInputChange}
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
