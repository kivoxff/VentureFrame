const CartItemCard = ({ product, actionButton, onQtyChange }) => {
  const {
    id,
    name,
    count,
    qty,
    salePrice,
    mrp,
    thumbnails,
    company,
    type,
    variants,
  } = product;
  const thumbnail = thumbnails[0]?.url;

  return (
    <div
      key={id}
      className="group p-4 basis-full md:basis-2/5 grow flex gap-2 border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="w-28 aspect-square relative border rounded-2xl overflow-hidden">
        <img
          src={thumbnail}
          alt="productImg"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={actionButton.func}
          className="p-2 w-9 absolute top-2 left-2 bg-white/50 backdrop-blur border border-gray-300 rounded-full"
        >
          <img
            src={actionButton.label}
            alt="addToCart"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      <div className="flex flex-col justify-between flex-1 border">
        <div>
          <p className="flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {type}
            </span>
            <span className="text-xs font-medium text-yellow-600">4⭐</span>
          </p>
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
            {name}
          </h3>
          {variants && (
            <p className="my-2 flex flex-wrap gap-2">
              <span className="text-sm">
                color:{" "}
                <span className="border p-1 rounded-full bg-blue-400 text-white text-xs font-semibold">
                  balck
                </span>
              </span>
              <span className="text-sm">
                size:{" "}
                <span className="border p-1 rounded-full bg-blue-400 text-white text-xs font-semibold">
                  xl
                </span>
              </span>
            </p>
          )}
        </div>

        <div>
          <span className="font-bold text-violet-900">₹{salePrice}</span>
          <input
            type="number"
            value={qty}
            onChange={(e) => onQtyChange(id, Number(e.target.value))}
            name="quantity"
            min={1}
            className="px-2 ml-2 font-semibold w-14 border rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
