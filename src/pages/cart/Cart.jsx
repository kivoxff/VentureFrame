import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartThunk } from "../../redux/cart/cartThunk";
import { removeFromCart, updateQty } from "../../redux/cart/cartSlice";
import { useAuth } from "../../context/AuthContext";

import ProductItemCard from "../../components/products/ProductItemCard";
import OrderSummary from "../../components/orders/OrderSummary";
import CouponBox from "../../components/orders/CouponBox";
import crossIcon from "../../assets/icons/cross.svg";
import { useNavigate } from "react-router-dom";
import { setCheckoutItems } from "../../redux/checkout/checkoutSlice";

const CartIsEmpty = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <h2 className="mb-4 text-4xl text-rose-500 text-center font-bold">
        Your cart is empty
      </h2>
      <button className="p-4 text-xl text-white font-semibold bg-violet-600 rounded-full">
        Shop Now
      </button>
    </div>
  );
};

const CartItemList = ({ products }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const uid = user?.userId;

  useEffect(() => {
    if (uid) dispatch(fetchCartThunk({ uid }));
  }, [uid]);

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-screen sm:max-h-[80vh]">
      {products.map((product) => (
        <ProductItemCard
          key={product.id}
          product={product}
          actionButton={{
            label: crossIcon,
            func: () => dispatch(removeFromCart({ item: product, uid })),
          }}
          onQtyChange={(id, qty) =>
            dispatch(updateQty({ id: product.id, qty, uid }))
          }
        />
      ))}
    </div>
  );
};

function Cart() {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const discount = useSelector((state) => state.checkout.discount);
  console.log(discount);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!cartItems || cartItems.length === 0) return <CartIsEmpty />;

  const handleCheckout = () => {
    dispatch(setCheckoutItems(cartItems));
    navigate("/checkout?step=address"); // navigate to checkout page
  };

  return (
    <section className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* LEFT: Cart Items */}
      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border">
        <CartItemList products={cartItems} />
      </div>

      {/* RIGHT: Summary + Coupon */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        <OrderSummary products={cartItems} discount={discount} />
        <CouponBox products={cartItems} />
        <button
          onClick={handleCheckout}
          className="w-full p-3 bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl mt-2"
        >
          Proceed to Checkout
        </button>
      </div>
    </section>
  );
}

export default Cart;
