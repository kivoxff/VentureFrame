import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductSpecsAndDetails from "./components/ProductSpecsAndDetails";

function ProductOverview({product}) {

    return (
        <section className="mt-2 mx-auto px-4 md:px-12 py-4 w-full max-w-7xl border flex justify-around gap-4 flex-wrap">
            {/* Images */}
            <ProductGallery thumbnails={product.thumbnails} />

            {/* Info */}
            <ProductInfo product={product} />

            {/* Spects and details */}
            <ProductSpecsAndDetails product={product} />
        </section>
    )
}

export default ProductOverview;