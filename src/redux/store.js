import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart/cartSlice";
import { cartMiddleware } from "./cart/cartMiddleware";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartMiddleware),
});
