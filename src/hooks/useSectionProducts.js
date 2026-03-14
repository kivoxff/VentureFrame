import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

export const useSectionProducts = ({ productIds, PRODUCTS_PER_PAGE = 9 }) => {
  const [products, setProducts] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // Convert the array to a string so React can compare the ACTUAL values,
  // not the memory references.
  const productIdsString = productIds.join(",");

  useEffect(() => {
    setProducts([]);
    setPageIndex(0);
  }, [productIdsString]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!productIds.length) return;

      const start = pageIndex * PRODUCTS_PER_PAGE;
      const end = start + PRODUCTS_PER_PAGE;
      const chunk = productIds.slice(start, end);

      if (!chunk.length) return;

      const productsRef = collection(db, "products");
      const q = query(productsRef, where(documentId(), "in", chunk));

      const snap = await getDocs(q);
      const fetched = snap.docs.map((doc) => {
        const {
          title: name,
          productId: id,
          stockStatus: status,
          storeName: seller,
          originalPrice: oldPrice,
          brand: company,
          ...data
        } = doc.data();

        return { id, name, status, seller, oldPrice, company, ...data };
      });

      setProducts((prev) => [...prev, ...fetched]);
    };

    loadProducts();
  }, [pageIndex, productIdsString]);

  const loadMore = () => {
    setPageIndex((prev) => prev + 1);
  };

  const hasMore = productIds.length > products.length;

  return {
    products,
    loadMore,
    hasMore,
  };
};
