import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { functions } from "../../firebase/config";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { removeCoupon, setCoupon } from "../../redux/checkout/checkoutSlice";

function CouponBox({ products = [] }) {
  const [code, setCode] = useState("");
  const { appliedCoupon, discount } = useSelector((state) => state.checkout);
  const dispatch = useDispatch();

  const subTotal = products.reduce(
    (acc, item) => acc + item.salePrice * item.qty,
    0,
  );

  const handleApply = async () => {
    if (!code) {
      toast.error("Enter coupon code");
      return;
    }

    try {
      const validateCoupon = httpsCallable(functions, "validateCoupon");

      // Backend should return: { coupon, discount }
      const res = await validateCoupon({ code, subTotal });

      dispatch(
        setCoupon({
          coupon: code,
          discount: res.data.discountAmount,
        }),
      );

      toast.success("Coupon applied!");
      setCode("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Invalid coupon");
    }
  };

  const handleRemove = () => {
    dispatch(removeCoupon());
    toast.info("Coupon removed");
  };

  return (
    <div className="p-4 border rounded-2xl bg-white mt-3">
      {appliedCoupon ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-green-700">
              {appliedCoupon} applied
            </p>
            <p className="text-sm text-gray-500">Discount: ₹{discount}</p>
          </div>

          <button
            onClick={handleRemove}
            className="px-3 py-1 bg-red-100 text-red-600 rounded-xl font-semibold"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="text"
            placeholder="Enter coupon code"
            className="flex-1 p-2 border rounded-xl"
          />

          <button
            onClick={handleApply}
            className="px-4 bg-violet-700 hover:bg-violet-600 text-white rounded-xl font-semibold"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export default CouponBox;
