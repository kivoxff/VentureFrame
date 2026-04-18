import { createSlice } from "@reduxjs/toolkit";
import { fetchCartThunk } from "./cartThunk";
import { toast } from "react-toastify";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cart")) || [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, qtyToAdd = 1 } = action.payload;

      const exist = state.cartItems.find((i) => i.id === item.id);
      const availableStock = item.count || 0;
      const isOutOfStock = availableStock === 0;

      if (exist) {
        exist.qty = Math.min(exist.qty + qtyToAdd, availableStock);
        exist.outOfStock = isOutOfStock;
      } else {
        state.cartItems.push({
          ...item,
          qty: Math.min(qtyToAdd, availableStock),
          outOfStock: isOutOfStock,
        });
      }

      toast.success("Added to cart");
    },

    updateQty: (state, action) => {
      const { id, qty } = action.payload;

      const item = state.cartItems.find((i) => i.id === id);
      if (!item) return;

      if (item.outOfStock) {
        item.qty = 0;
        toast.error("Out Of Stock");
      } else {
        const availableStock = item.count || 0;
        item.qty = Math.max(1, Math.min(qty, availableStock));
      }
    },

    removeFromCart: (state, action) => {
      const { item } = action.payload;
      const itemIndex = state.cartItems.findIndex(
        (cartItem) => cartItem.id === item.id,
      );

      if (itemIndex > -1) {
        state.cartItems.splice(itemIndex, 1);
        toast.success("Removed from cart");
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCartThunk.fulfilled, (state, action) => {
      state.cartItems = action.payload;
    });
  },
});

export const { addToCart, updateQty, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
