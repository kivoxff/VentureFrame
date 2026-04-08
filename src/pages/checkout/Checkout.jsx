import { useSearchParams } from "react-router-dom";
import ShippingDetails from "./components/ShippingDetails";
import OrderSummary from "../../components/orders/OrderSummary";
import OrderSuccess from "./components/OrderSuccess";
import Payment from "./components/Payment";
import StepIndicator from "../../components/ui/misc/StepIndicator";
import CouponBox from "../../components/orders/CouponBox";
import { useSelector } from "react-redux";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId"); // From Stripe redirect

  const step = searchParams.get("step") || "address";
  const {
    checkoutItems: items,
    paymentMethod: method,
    discount,
  } = useSelector((state) => state.checkout);

  const steps =
    method === "COD"
      ? ["Address", "Success"] // COD → 2 steps
      : ["Address", "Payment", "Success"]; // ONLINE → 3 steps

  const getCurrentStep = () => {
    if (method === "COD") {
      return step === "address" ? 1 : 2; // only 2 steps
    } else {
      return step === "address" ? 1 : step === "payment" ? 2 : 3;
    }
  };

  if (step === "success") {
    return <OrderSuccess />;
  }

  return (
    <section className="max-w-7xl mx-auto p-4 flex flex-col gap-6">
      <StepIndicator steps={steps} currentStep={getCurrentStep()} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border">
          {step === "address" && <ShippingDetails />}

          {step === "payment" && method !== "COD" && <Payment />}

          {/* {step === "success" && <OrderSuccess />} */}
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-87.5 flex flex-col gap-3">
          <OrderSummary products={items} discount={discount} />
          <CouponBox products={items} />
        </div>
      </div>
    </section>
  );
};

export default Checkout;
