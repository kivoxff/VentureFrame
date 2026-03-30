import OrderSummery from "../../components/orders/OrderSummary";
import ProductItemCard from "../../components/products/ProductItemCard";
import crossIcon from "../../assets/icons/cross.svg";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQty } from "../../redux/cart/cartSlice";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { fetchCartThunk } from "../../redux/cart/cartThunk";

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
    dispatch(fetchCartThunk({ uid }));
  }, []);

  return (
    <div className="w-full md:w-2/3 sm:max-h-screen sm:overflow-y-auto scrollbar-thin flex flex-col gap-2">
      {products.map((product) => (
        <ProductItemCard
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
  console.log(cartItems);

  return cartItems?.length === 0 ? (
    <CartIsEmpty />
  ) : (
    <section className="flex flex-col-reverse sm:flex-row gap-2 border">
      <CartItemList products={cartItems} />
      <OrderSummery type="cart" products={cartItems} />
    </section>
  );
}

export default Cart;
