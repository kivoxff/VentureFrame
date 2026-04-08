function OrderSummary({
  products = [],
  discount = 0,
  FREE_DELIVERY_THRESHOLD = 500,
  DELIVERY_CHARGE = 50,
}) {
  // 🔹 Calculate subtotal
  const subTotal = products.reduce(
    (acc, item) => acc + item.salePrice * item.qty,
    0,
  );

  const delivery = subTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subTotal + delivery - discount;

  return (
    <div className="p-3 w-full sm:flex-1 max-h-fit rounded-2xl border">
      <h3 className="font-bold text-xl">Order Summary</h3>

      {/* Product List */}
      <div className="mb-2 border-b">
        {products.map((item) => (
          <p key={item.id} className="mb-2 flex justify-between">
            <span>
              {item.name} × {item.qty}
            </span>
            <span className="font-semibold">₹{item.salePrice * item.qty}</span>
          </p>
        ))}
      </div>

      {/* Price Breakdown */}
      <div>
        <p className="mb-2 flex justify-between">
          <span className="font-light">Subtotal</span>
          <span className="font-semibold">₹{subTotal}</span>
        </p>

        {discount > 0 && (
          <p className="mb-2 flex justify-between">
            <span className="font-light">Discount</span>
            <span className="font-semibold">- ₹{discount}</span>
          </p>
        )}

        <p className="mb-2 flex justify-between">
          <span className="font-light">Delivery</span>
          <span className="font-semibold">
            {delivery === 0 ? (
              <span className="text-green-700"> Free</span>
            ) : (
              <span>₹{delivery}</span>
            )}
          </span>
        </p>

        <p className="mb-2 border-t flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-semibold text-violet-700">₹{total}</span>
        </p>
      </div>
    </div>
  );
}

export default OrderSummary;
