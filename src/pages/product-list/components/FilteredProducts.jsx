import Loader from "../../../components/ui/misc/Loader";
import ListCard from "./ListCard";

function FilteredProducts({ products, loading, hasMore, onLoadMore }) {
  
  // Show full screen loader ONLY if it's the first page loading
  if (loading && products.length === 0) {
    return (
      <section className="w-full py-20 flex justify-center items-center h-64">
        <Loader size={40} />
      </section>
    );
  }

  return (
    <section className="w-full py-8 font-sans max-w-7xl mx-auto flex flex-col items-center">
      
      {products.length === 0 && !loading ? (
        <div className="w-full text-center text-gray-500 py-20 flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No products found</h2>
          <p>Try adjusting your search or clearing some filters.</p>
        </div>
      ) : (
        <div className="flex justify-around flex-wrap w-full">
                {products.map((product) => (
                    <ListCard key={product.id} product={product} />
                ))}
            </div>
      )}

      {/* THE LOAD MORE BUTTON */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="mt-10 px-8 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Loading...
            </>
          ) : (
            "Load More"
          )}
        </button>
      )}
    </section>
  );
}

export default FilteredProducts;