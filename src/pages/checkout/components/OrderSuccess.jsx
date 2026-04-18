import { useNavigate, useSearchParams } from "react-router-dom";
import successIcon from "../../../assets/icons/success.svg";

function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="w-full flex justify-center items-center px-4 py-5">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border p-6 sm:p-10 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
          <img src={successIcon} alt="success" className="w-full h-2/3" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Order Placed Successfully 🎉
        </h3>

        <p className="text-gray-500 text-sm sm:text-base max-w-md">
          Your order has been successfully placed and is now being processed.
          Sit back and relax — we'll notify you once it's on the way 🚚
        </p>

        {orderId && (
          <div className="bg-gray-100 px-4 py-3 rounded-xl text-sm sm:text-base">
            <span className="text-gray-600">Order ID: </span>
            <span className="font-semibold text-gray-800">{orderId}</span>
          </div>
        )}

        <div className="w-full border-t border-dashed" />

        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full p-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate(`/order-details/${orderId}`)}
            className="w-full p-3 rounded-xl bg-violet-700 text-white font-bold hover:bg-violet-600 transition"
          >
            View Order Details
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-400 mt-1">
          Need help? Contact support anytime.
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
