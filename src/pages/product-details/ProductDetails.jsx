import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import ProductOverview from "./product-overview/ProductOverview";
import ProductReviews from "./product-reviews/ProductReviews";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

function ProductDetails() {
  const { pid } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productRef = doc(db, "products", pid);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const {
          productId: id,
          title: name,
          stockStatus: status,
          storeName: seller,
          originalPrice: oldPrice,
          features: highlights,
          ...data
        } = productSnap.data();

        setProduct({
          id,
          name,
          status,
          seller,
          oldPrice,
          highlights,
          rating: 4.6,
          ratings: { 5: 20, 4: 50, 3: 10, 2: 20, 1: 5 },
          reviews: 2543,
          ...data,
        }); // change: rating
      }
    };

    fetchProduct();
  }, [pid]);

  if(!product) return(
    <h1>Loading...</h1>
  )

  return (
    <AppLayout>
      <FloatingNavButtons />
      <ProductOverview product={product} />
      <ProductReviews />
    </AppLayout>
  );
}

export default ProductDetails;
