import { useState } from "react";

function ProductInfo({ product }) {
  const [selectedOptions, setSelectedOptions] = useState(() =>
    Object.fromEntries(
      // object from array of array's
      product.variants.map(({ name: key, values }) => [key, values[0]]),
    ),
  );

  console.log(product.variants.map(({ name: key, values }) => [key, values[0]]));

  const [quantity, setQuantity] = useState(1);
  const formatNum = (num) => num.toLocaleString("en-IN");
  const handleQuantity = (e) => {
    const value = e.target.value;
    if (value >= 1) setQuantity(value);
  };

  return (
    <div className="w-full md:w-2/5 border">
      <h1 className="text-3xl font-semibold capitalize">{product.name}</h1>

      <div className="flex items-center gap-3 flex-wrap mt-2">
        <span className="text-2xl font-bold">₹{formatNum(product.salePrice)}</span>
        <span className="line-through text-gray-400">
          ₹{formatNum(product.mrp)}
        </span>
        <span className="text-green-600 font-medium">
          Save up to ₹{formatNum(product.mrp - product.salePrice)}
        </span>
      </div>

      {/* Ratings */}
      <div className="flex items-center mt-2 gap-3">
        <span className="text-yellow-400 text-lg">★★★★☆</span>
        <span className="text-sm text-gray-500">
          {product.rating} ({formatNum(product.reviews)} ratings)
        </span>
      </div>

      {/* Highlights */}
      <ul className="mt-8 space-y-2">
        {product.highlights.map((item, idx) => (
          <li key={idx} className="text-gray-700 list-disc list-inside">
            {item}
          </li>
        ))}
      </ul>

      {/* Options */}
      <div className="mt-8 space-y-5">
        {product.variants.map(({ name: key, values }, idx) => (
          <div key={key}>
            <h3 className="font-semibold mb-2 capitalize">{key}</h3>
            <div className="flex flex-wrap gap-3">
              {values.map((value) => (
                <button
                  onClick={() =>
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [key]: value,
                    }))
                  }
                  key={value}
                  className={`px-2 py-2 border rounded-full cursor-pointer text-xs font-medium capitalize ${
                    selectedOptions[key] === value
                      ? "border-rose-400 bg-rose-700 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 w-full flex gap-3">
        <span className="font-semibold">Quantity:</span>
        <input
          onChange={handleQuantity}
          type="number"
          value={quantity}
          name="quantity"
          min={1}
          className="px-2 font-semibold w-14 border rounded-lg"
        />
      </div>

      {/* CTA */}
      {product.status === "In Stock" ? (
        <div className="w-full mt-8 flex justify-center gap-3">
          <button className="p-2.5 w-1/2 bg-rose-700 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer">
            Add to cart
          </button>
          <button className="p-2.5 w-1/2 bg-gray-900 hover:bg-gray-950 text-white font-bold rounded-xl cursor-pointer">
            Buy Now
          </button>
        </div>
      ) : (
        <div className="mt-8 px-6 py-3 border border-gray-200 text-gray-800 text-sm text-center font-bold rounded-xl shadow-sm">
          Currently Unavailable
        </div>
      )}
    </div>
  );
}

export default ProductInfo;
