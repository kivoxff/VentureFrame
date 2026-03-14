import Loader from "./Loader";

const LoadMore = ({
  loading = false,
  hasMore = true,
  onClick,
  children = "Load more results",
  endMessage = "No more results",
}) => {
  return (
    <div className="group flex items-center gap-4 py-4">
      <div className="h-px flex-1 bg-gray-200 group-has-[button:hover]:bg-violet-400 transition-colors duration-300"></div>

      {hasMore ? (
        <button
          onClick={!loading ? onClick : undefined}
          disabled={loading || !hasMore}
          className={`
            p-2 gap-2 text-sm font-medium border
            text-gray-500 hover:text-violet-600
            transition-colors duration-300
            cursor-pointer rounded-full
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          {loading ? <Loader size={18} /> : children}
        </button>
      ) : (
        <span className="p-2 text-sm text-gray-400">{endMessage}</span>
      )}

      <div className="h-px flex-1 bg-gray-200 group-has-[button:hover]:bg-violet-400 transition-colors duration-300"></div>
    </div>
  );
};

export default LoadMore;
