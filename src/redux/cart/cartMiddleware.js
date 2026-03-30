import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const CART_ACTIONS = [
  "cart/addToCart",
  "cart/removeFromCart",
  "cart/updateQty",
];

let timeout; // persists between actions

const syncCart = async (items, uid) => {
  // Always keep local copy
  localStorage.setItem("cart", JSON.stringify(items));

  // If user not logged in, stop here
  if (!uid) return;

  // Make Cloud copy SKINNY (Only ID and Quantity)
  const cloudItems = items.map((item) => ({
    productId: item.id,
    quantity: item.qty,
  }));

  console.log("Syncing cart to Firestore", items);

  const cartRef = doc(db, "carts", uid);
  await setDoc(cartRef, { items: cloudItems }, { merge: true });
};

export const cartMiddleware = (store) => (next) => async (action) => {
  // Get state BEFORE action
  const previousCart = store.getState().cart.cartItems;

  // Let the action hit the reducers/next middeware
  const result = next(action);

  // Get state AFTER action
  const currentCart = store.getState().cart.cartItems;

  // If the cart actually changed, sync it!
  if (
    JSON.stringify(previousCart) !== JSON.stringify(currentCart) &&
    CART_ACTIONS.includes(action.type)
  ) {
    const { cartItems } = store.getState().cart;
    const uid = action.payload?.uid; // (Or get from store.getState().auth.uid)

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      syncCart(cartItems, uid);
    }, 500); // wait 500ms after last change
  }

  return result;
};
