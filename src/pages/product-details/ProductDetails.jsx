import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import ProductOverview from "./product-overview/ProductOverview";
import ProductReviews from "./product-reviews/ProductReviews";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { getServerNow } from "../../context/TimeContext";
import { calculateEffectiveStock } from "../../utils/stockUtils";

function ProductDetails() {
  const { pid } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productRef = doc(db, "products", pid);
      const reservedRef = doc(db, "reservedProducts", pid);

      const [productSnap, reservedSnap] = await Promise.all([
        getDoc(productRef),
        getDoc(reservedRef),
      ]);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        const reservedData = reservedSnap.exists() ? reservedSnap.data() : null;
        
        const now = await getServerNow();

        const effectiveStock = await calculateEffectiveStock(
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
        } = productSnap.data();

        setProduct({
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
          rating: 4.6,
          ratings: { 5: 20, 4: 50, 3: 10, 2: 20, 1: 5 },
          reviews: 2543,
        }); // change: rating
      }
    };

    fetchProduct();
  }, [pid]);

  if (!product) return <h1>Loading...</h1>;

  return (
    <AppLayout>
      <FloatingNavButtons />
      <ProductOverview product={product} />
      <ProductReviews />
    </AppLayout>
  );
}

export default ProductDetails;
