export const getReservations = async (productIds, batchSize = 10) => {
// FIX: Early return to prevent Firebase error on empty cart
  if (!productIds || productIds.length === 0) return [];

  const reservation = [];

   for (let start = 0; start < productIds.length; start += batchSize) {
      const batchIds = productIds.slice(start, start + batchSize);
  
      const q = query(
        collection(db, "reservedProducts"),
        where(documentId(), "in", batchIds),
      );
  
      const reservedSnap = await getDocs(q);
      reservedSnap.forEach((doc) => {
        const {
          productId: id,
          title: name,
          stock: count,
          stockStatus: status,
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
        } = doc.data();
  
        products.push({
          id,
          name,
          count,
          status,
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
  
    return reservation;
} 