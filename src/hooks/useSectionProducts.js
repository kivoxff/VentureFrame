import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { getServerNow } from "../context/TimeContext";
import { calculateEffectiveStock } from "../utils/stockUtils";

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
      const reservedRef = collection(db, "reservedProducts");

      const qProducts = query(productsRef, where(documentId(), "in", chunk));
      const qReserved = query(reservedRef, where(documentId(), "in", chunk));

      const [productsSnap, reservedSnap] = await Promise.all([
        getDocs(qProducts),
        getDocs(qReserved),
      ]);

      // Create a fast lookup map for reservations
      const reservedMap = {};
      reservedSnap.forEach((doc) => {
        reservedMap[doc.id] = doc.data();
      });

      const now = await getServerNow();

      const fetched = productsSnap.docs.map((doc) => {
        const productData = doc.data();
        const reservedData = reservedMap[doc.id];

        const effectiveStock = calculateEffectiveStock(
          productData.stock,
          reservedData,
          now,
        );
        const effectiveStatus =
          effectiveStock > 0 ? "In Stock" : "Out of Stock";

        const {
          title: name,
          productId: id,
          // stockStatus: status,
          // stock: count,
          storeName: seller,
          price: salePrice,
          originalPrice: mrp,
          images: thumbnails,
          brand: company,
          options: variants,
          features: highlights,
          category: type,
          description: details,
          specs: attributes,
        } = productData;

        return {
          id,
          name,
          status: effectiveStatus,
          count: effectiveStock,
          seller,
          salePrice,
          mrp,
          thumbnails,
          company,
          variants,
          highlights,
          type,
          attributes,
          details,
        };
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
