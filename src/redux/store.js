import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart/cartSlice";
import { cartMiddleware } from "./cart/cartMiddleware";
import checkoutReducer from "./checkout/checkoutSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    checkout: checkoutReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartMiddleware),
});
