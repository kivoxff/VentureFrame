import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductSpecsAndDetails from "./components/ProductSpecsAndDetails";

function ProductOverview({product}) {

    // const product = {
    //     name: "Samsung Galaxy S23 Ultra",
    //     price: 124999,
    //     oldPrice: 139999,
    //     rating: 4.6,
    //     ratings: { 5: 20, 4: 50, 3: 10, 2: 20, 1: 5 },
    //     reviews: 2543,

    //     images: [
    //         "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    //         "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    //         "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    //         "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800"
    //     ],

    //     highlights: [
    //         "200MP Pro-grade Camera",
    //         "Snapdragon 8 Gen 2 Processor",
    //         "5000mAh Battery",
    //         "S-Pen Support",
    //         "Dynamic AMOLED 2X Display",
    //     ],

    //     options: {
    //         Color: ["Phantom Black", "Green", "Cream"],
    //         Storage: ["256GB", "512GB", "1TB"],
    //         Warranty: ["1 Year", "2 Years"],
    //     },

    //     specs: {
    //         Brand: "Samsung",
    //         Model: "Galaxy S23 Ultra",
    //         Display: "6.8-inch AMOLED",
    //         Processor: "Snapdragon 8 Gen 2",
    //         RAM: "12 GB",
    //         Battery: "5000 mAh",
    //         OS: "Android 13",
    //         Weight: "234 g",
    //     },

    //     description: "The Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday use The Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday useThe Samsung Galaxy S23 Ultra brings professional-grade photography, ultra-smooth performance, and a breathtaking Dynamic AMOLED display, all wrapped in a refined premium design. Powered by a flagship processor and enhanced with S-Pen support, it delivers a seamless experience for productivity, creativity, and everyday use"
    // };


    return (
        <section className="mt-2 mx-auto px-4 md:px-12 py-4 w-full max-w-7xl border flex justify-around gap-4 flex-wrap">
            {/* Images */}
            <ProductGallery images={product.images} />

            {/* Info */}
            <ProductInfo product={product} />

            {/* Spects and details */}
            <ProductSpecsAndDetails product={product} />
        </section>
    )
}

export default ProductOverview;