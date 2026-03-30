import { createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  documentId,
  getDocs,
} from "firebase/firestore";
import { getServerNow } from "../../context/TimeContext";
import { calculateEffectiveStock } from "../../utils/stockUtils";

// helper function for batch based products fetching
export const fetchProductsByIds = async (productIds, batchSize = 10) => {
  // FIX: Early return to prevent Firebase error on empty cart
  if (!productIds || productIds.length === 0) return [];

  const products = [];

  for (let start = 0; start < productIds.length; start += batchSize) {
    const batchIds = productIds.slice(start, start + batchSize);

    const qProducts = query(
      collection(db, "products"),
      where(documentId(), "in", batchIds),
    );

    const qReserved = query(
      collection(db, "reservedProducts"),
      where(documentId(), "in", batchIds),
    );

    const [productsSnap, reservedSnap] = await Promise.all([
      getDocs(qProducts),
      getDocs(qReserved),
    ]);

    const reservedMap = {};
    reservedSnap.forEach((doc) => {
      reservedMap[doc.id] = doc.data();
    });

    const now = await getServerNow();

    productsSnap.forEach((doc) => {
      const productData = doc.data();
      const reservedData = reservedMap[doc.id];

      const effectiveStock = calculateEffectiveStock(
        productData.stock,
        reservedData,
        now,
      );
      const effectiveStatus = effectiveStock > 0 ? "In Stock" : "Out of Stock";

      const {
        productId: id,
        title: name,
        // stock: count,
        // stockStatus: status,
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

      products.push({
        id,
        name,
        count: effectiveStock,
        status: effectiveStatus,
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
      });
    });
  }

  return products;
};

export const fetchCartThunk = createAsyncThunk(
  "cart/fetchCart",
  async ({ uid }) => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];

    // if (!uid) return localCart;
    let cloudCart = [];

    if (uid) {
      // user logged in
      const cartRef = doc(db, "carts", uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        cloudCart =
          cartSnap.data().items.map((item) => ({
            id: item.productId,
            qty: item.quantity,
          })) || [];
      }
    }

    // Proper Merge Strategy
    const mergedCart = localCart.map((item) => ({ ...item }));

    cloudCart.forEach((cloudItem) => {
      const exist = mergedCart.find((item) => item.id === cloudItem.id);

      if (exist) {
        // Resolve conflict by taking the higher quantity
        exist.qty = Math.max(exist.qty, cloudItem.qty);
      } else {
        mergedCart.push(cloudItem);
      }
    });

    const productIds = mergedCart.map((item) => item.id);
    const fetchedProducts = await fetchProductsByIds(productIds); // final source of truth

    // Prepare arrays respecting your specific naming constraints
    const updatedLocalCart = []; // For Local (id, qty)
    const updatedCloudCart = []; // For Cloud (productId, quantity)

    mergedCart.forEach((item) => {
      const productData = fetchedProducts.find((p) => p.id === item.id);

      if (productData) {
        // STOCK VALIDATION
        const availableStock = productData.count || 0;
        const isOutOfStock = availableStock === 0;
        const newQty = Math.min(item.qty, availableStock);

        // Local Format (Rich data + id, qty)
        updatedLocalCart.push({
          ...productData,
          qty: newQty,
          outOfStock: isOutOfStock,
        });

        // Cloud Format (Skinny data: productId, quantity)
        updatedCloudCart.push({
          productId: productData.id,
          quantity: newQty,
        });
      }
    });

    // update local
    localStorage.setItem("cart", JSON.stringify(updatedLocalCart));

    // update cloud only if user is logged in
    if (uid) {
      const cartRef = doc(db, "carts", uid);
      await setDoc(cartRef, { items: updatedCloudCart }, { merge: true });
    }

    return updatedLocalCart;
  },
);
