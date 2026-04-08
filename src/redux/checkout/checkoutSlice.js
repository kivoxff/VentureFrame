import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkoutItems: [],
  paymentMethod: "ONLINE",
  appliedCoupon: null,
  discount: null,
  clientSecret: null,
  orderId: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutItems: (state, action) => {
      state.checkoutItems = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    setPaymentSession: (state, action) => {
      state.clientSecret = action.payload.clientSecret;
      state.orderId = action.payload.orderId;
    },

    setCoupon: (state, action) => {
      state.appliedCoupon = action.payload.coupon;
      state.discount = action.payload.discount;
    },

    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
    },

    clearCheckout: (state) => {
       state.checkoutItems = [];
      state.paymentMethod = "ONLINE";
      state.clientSecret = null;
      state.orderId = null;
      state.appliedCoupon = null;
      state.discount = 0;
    },
  },
});

export const {
   setCheckoutItems,
  setPaymentMethod,
  setPaymentSession,
  setCoupon,
  removeCoupon,
  clearCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
