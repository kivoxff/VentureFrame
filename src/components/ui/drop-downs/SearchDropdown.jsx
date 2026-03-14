import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../firebase/config";

const SearchDropdown = ({ searchVal, onSelect }) => {
  const [results, setResults] = useState([]);

  const searchProducts = async (searchVal) => {
    const val = searchVal.trim();
    if (!val) return [];

    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      orderBy("title"),
      startAt(val),
      endAt(val + "\uf8ff"),
      limit(30),
    );

    const productsSnap = await getDocs(q);

    console.log("Search Snap Size:", productsSnap.size);

    return productsSnap.docs.map((doc) => {
      const {
        title: name,
        productId: id,
        stockStatus: status,
        storeName: seller,
        ...data
      } = doc.data();

      return { id, name, status, seller, ...data };
    });
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchVal) {
        searchProducts(searchVal).then(setResults);
      } else setResults([]);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  return (
    <div className="p-2 w-5/6 max-h-40 bg-white hidden peer-focus:flex flex-col absolute top-full left-1/2 z-10 transform -translate-x-1/2 border overflow-y-auto shadow-xl scrollbar-thin">
      {results.length > 0 ? (
        results.map((product, idx) => (
          // This prevents the input from losing focus immediately
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect?.(product);
            }}
            key={idx}
            className="mb-2 flex items-center gap-2 border hover:bg-green-50"
          >
            <div className="w-8 h-8 shrink-0 rounded-md overflow-hidden bg-gray-100">
              <img
                className="w-full h-full object-cover"
                src={product.images?.[0]?.url}
                alt={product.name}
              />
            </div>
            <span className="text-sm font-medium text-gray-800 truncate">
              {product.name}
            </span>
          </button>
        ))
      ) : (
        <span className="text-sm text-center text-gray-400 p-2">
          No results
        </span>
      )}
    </div>
  );
};

export default SearchDropdown;
