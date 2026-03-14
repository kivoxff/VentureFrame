function OrderSummary({ type = "cart" }) {
  return (
    <div className="p-3 w-full sm:flex-1 h-fit rounded-2xl border">
      <h3 className="font-bold text-xl">Order Summery</h3>

      {
        type === "checkout" &&
        <div className="mb-2 border-b">
          <p className="mb-2 flex justify-between">
            <span>I Phone</span>
            <span className="font-semibold">₹9999</span>
          </p>
          <p className="mb-2 flex justify-between">
            <span>Charger</span>
            <span className="font-semibold">₹4999</span>
          </p>
        </div>
      }

      <div>
        <p className="mb-2 flex justify-between">
          <span className="font-light">Subtotal</span>
          <span className="font-semibold">₹999</span>
        </p>
        <p className="mb-2 flex justify-between">
          <span className="font-light">Delivery</span>
          <span className="font-semibold">₹0</span>
        </p>

        <p className="mb-2 border-t flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-semibold text-violet-700">₹999</span>
        </p>
      </div>

      {
        type === "cart" &&
        <div>
          <div className="mb-2 flex justify-between gap-2">
            <input type="text" placeholder="Add promo code" className="min-w-0 p-2 border rounded-2xl flex-1" />
            <button className="p-3 bg-violet-700 hover:bg-violet-600 rounded-full text-white font-bold">Apply</button>
          </div>

          <button className="w-full p-3 bg-violet-700 hover:bg-violet-600 text-white font-bold ">Proceed to Checkout</button>
        </div>
      }
    </div>

  )
}

export default OrderSummary;