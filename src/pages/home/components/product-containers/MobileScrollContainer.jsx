import SectionTitle from "../../../../components/ui/misc/SectionTitle";
import { Link } from "react-router-dom";
import Loader from "../../../../components/ui/misc/Loader";

const LoadMoreCard = ({ loadMore, hasMore = true, loading = false }) => {
  return (
    <div className="w-full flex justify-center">
      <div
        onClick={loadMore}
        className="min-w-44 sm:w-1/3 lg:w-1/4 sm:h-8 flex justify-center items-center cursor-pointer border border-gray-300 
      font-medium rounded-t-2xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:text-blue-600"
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

const MobileScrollCard = ({ product }) => {
  const { id, name, seller, salePrice, mrp, thumbnails, company } = product;
  const thumbnail = thumbnails[0]?.url;

  const isSale = mrp && mrp > salePrice;

  return (
    <Link
      to={`/product-details/${id}`}
      className="group min-w-44 sm:w-1/3 lg:w-1/4 border border-gray-300 rounded-t-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      <div className="w-full aspect-square overflow-hidden relative">
        <img
          src={thumbnail}
          alt="productImg"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <button className="w-full h-1/6 border text-xl text-white font-semibold bg-black/80 absolute bottom-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          Add to cart
        </button>

        {isSale && (
          <span className="absolute px-2 py-1 top-4 left-4 border bg-rose-600 text-white text-sm font-bold rounded-xl">
            SALE
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="px-5 py-2 w-full border">
        <p className="pb-1 text-gray-500 text-xs uppercase truncate">
          {category}{" "}
          <span className="px-2 pb-0.5 rounded-xl bg-green-200 text-yellow-600 text-xs font-semibold capitalize tracking-wide">
            {company}
          </span>
        </p>
        <h2 className="pb-1 truncate text-md font-semibold group-hover:text-rose-500">
          {name}
        </h2>
        <span className="pr-3 text-xl font-bold">₹{salePrice}</span>

        {isSale && (
          <span className="text-gray-400 text-sm line-through ">₹{mrp}</span>
        )}
      </div>
    </Link>
  );
};

function MobileScrollContainer({ title, products = [], loadMore, hasMore }) {
  return (
    <section className="mx-auto mt-2 px-4 sm:px-12 w-full max-w-7xl border">
      <SectionTitle title={title} />

      <div className="py-8 w-full flex justify-around flex-nowrap sm:flex-wrap gap-8 overflow-x-auto scrollbar-none border">
        {products.map((product) => (
          <MobileScrollCard key={product.id} product={product} />
        ))}
        {/* Load more products */}
        <LoadMoreCard loadMore={loadMore} hasMore={hasMore} />{" "}
      </div>
    </section>
  );
}

export default MobileScrollContainer;
