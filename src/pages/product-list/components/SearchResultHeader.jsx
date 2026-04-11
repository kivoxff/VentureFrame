function SearchResultHeader({ searchQuery }) {
  return (
    <div className="mx-auto my-4 max-w-7xl font-sans">
      <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
        Results for <span className="text-rose-600">"{searchQuery}"</span>
      </h2>
      
      <div className="h-1 w-20 bg-rose-600 mt-3 sm:mt-2"></div>
    </div>
  );
}

export default SearchResultHeader;