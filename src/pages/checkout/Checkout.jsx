import { useState } from "react";
import ShippingDetails from "./components/ShippingDetails";
import OrderSummery from "../../components/orders/OrderSummary";
import OrderSuccess from "./components/OrderSuccess";
import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";

const Checkout = () => {
  const [step, setStep] = useState(1);

  return (
    <section className="flex flex-wrap justify-center gap-4">
      <FloatingNavButtons />

      {/* Address From */}
      {step === 1 && <ShippingDetails />}
      {step === 2 && <OrderSuccess />}

      {/* Order Summery */}
      <OrderSummery type="checkout" />
    </section>
  )
};

export default Checkout;