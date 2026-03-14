import ProductItemCard from "../../../components/products/ProductItemCard";
import addToCart from "../../../assets/icons/addToCart.svg";

const FilteredProductCard = ({ product }) => {
    return (
        <div className="group p-4 w-full md:w-2/5 flex gap-2 border rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-28 aspect-square relative border rounded-2xl overflow-hidden">
                <img src={product.image} alt="productImg" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <button className="p-2 w-9 absolute top-2 left-2 bg-white/50 backdrop-blur border border-gray-300 rounded-full"><img src={addToCart} alt="addToCart" className="w-full h-full object-cover" /></button>
            </div>

            <div className="flex flex-col justify-between flex-1 border">
                <div>
                    <p className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                        <span className="text-xs font-medium text-yellow-600">4⭐</span>
                    </p>
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{product.name}</h3>
                </div>

                <div>
                    <span className="font-bold text-violet-900">₹{product.price}</span>
                    {product.oldPrice && <span className="ml-2 text-xs text-gray-500 line-through">₹{product.oldPrice}</span>}
                </div>
            </div>
        </div>
    )
}

function FilteredProducts() {
    const products = [
        { id: 1, name: "Premium Wireless Headphones", price: "4,999", oldPrice: "6,999", category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", isSale: true },
        { id: 2, name: "Minimalist Leather Watch", price: "2,499", oldPrice: null, category: "Accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", isSale: false },
        { id: 3, name: "Smart Fitness Tracker", price: "3,200", oldPrice: "3,999", category: "Wearables", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500", isSale: true },
        { id: 4, name: "Portable Bluetooth Speaker", price: "1,850", oldPrice: null, category: "Electronics", image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500", isSale: false },
        { id: 5, name: "Organic Cotton T-Shirt", price: "899", oldPrice: "1,200", category: "Apparel", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", isSale: false },
        { id: 6, name: "Designer Sunglasses", price: "1,500", oldPrice: "2,500", category: "Accessories", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500", isSale: true },
    ];

    return (
        <section className="my-4 w-full flex flex-wrap justify-around items-center gap-2 border">
            {products.map((product) => (
                <ProductItemCard
                    product={product}
                    actionButton={{
                        label: addToCart,
                        func: () => null
                    }}
                />
            ))}
        </section>
    );
}

export default FilteredProducts;
