import { useState } from "react";
import Loader from "../../../../components/ui/misc/Loader";
import SectionTitle from "../../../../components/ui/misc/SectionTitle";
import { Link } from "react-router-dom";

const LoadMoreCard = ({ loadMore, hasMore = true, loading = false }) => {
  return (
    <div className="w-full flex justify-center">
      <div
        onClick={loadMore}
        className="min-w-32 w-2/5 sm:min-w-80 h-8 sm:h-auto flex justify-center items-center cursor-pointer rounded-2xl border 
    bg-white font-medium overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:text-blue-600
    border-gray-200 transition-all duration-300"
      >
        {hasMore ? (
          loading ? (
            <Loader size={25} />
          ) : (
            <span className="sm:text-xl">Load More</span>
          )
        ) : (
          <span className="p-2 text-sm text-gray-400">No more results</span>
        )}
      </div>
    </div>
  );
};

const DesktopScrollCard = ({ product }) => {
  const { id, name, price, oldPrice, images = [], company } = product;
  const image = images[0]?.url;

  const isSale = oldPrice && oldPrice > price;
  const percentOff = isSale
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product-details/${id}`}
      className="group min-w-32 w-2/5 sm:min-w-80 rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="p-4 w-full aspect-square sm:h-3/4 relative overflow-hidden">
        <img
          src={image}
          alt="productImg"
          className="w-full h-full object-cover rounded-xl"
        />
        {isSale && (
          <span className="absolute top-7 left-7 font-bold text-xs sm:text-sm text-white drop-shadow-lg">
            {percentOff}% OFF
          </span>
        )}
        <button className="p-1.5 w-3/4 text-white bg-black/80 font-semibold absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full group-hover:-translate-y-full transition-transform duration-300 rounded-2xl border">
          Add to cart
        </button>
      </div>

      {/* Title + Price */}
      <div className="px-4 w-full flex items-center justify-between gap-1 flex-col">
        <h2 className="w-full text-sm font-medium text-center text-gray-800 truncate">
          {name}
        </h2>

        <div className="flex items-end gap-1">
          <span className="text-sm font-semibold text-gray-900">₹{price}</span>
          {isSale && (
            <span className="text-xs line-through text-gray-400">
              ₹{oldPrice}
            </span>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="mx-4 my-2 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full text-center">
        {company}
      </div>
    </Link>
  );
};

function DesktopScrollContainer({ title, products = [], loadMore, hasMore }) {
  return (
    <section className="mx-auto mt-2 px-4 sm:px-12 w-full max-w-7xl border">
      <SectionTitle title={title} />

      <div className="py-8 w-full flex justify-around gap-4 sm:gap-8 flex-wrap sm:flex-nowrap sm:overflow-x-auto scrollbar-none">
        {products.map((product) => (
          <DesktopScrollCard key={product.id} product={product} />
        ))}
        {/* Load more products */}
        <LoadMoreCard loadMore={loadMore} hasMore={hasMore} />
      </div>
    </section>
  );
}

export default DesktopScrollContainer;
