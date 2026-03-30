function ProductSpecsAndDetails({ product }) {
  return (
    <div className="w-full">
      {/* Specs */}
      <div className="mt-8 w-full border rounded-2xl capitalize">
        {product.attributes.map(({ name: key, value }) => (
          <div className="p-2 w-full flex justify-between border-b last:border-none">
            <span className="text-gray-500 font-semibold">{key}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">About this item</h3>
        <p className="max-h-96 overflow-auto text-gray-600 leading-relaxed border scrollbar-thin">
          {product.details}
        </p>
      </div>
    </div>
  );
}

export default ProductSpecsAndDetails;
