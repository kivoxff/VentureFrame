import OrderSummery from "../../components/orders/OrderSummary";
import ProductItemCard from "../../components/products/ProductItemCard";
import crossIcon from "../../assets/icons/cross.svg";

const CartIsEmpty = () => {
    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <h2 className="mb-4 text-4xl text-rose-500 text-center font-bold">Your cart is empty</h2>
            <button className="p-4 text-xl text-white font-semibold bg-violet-600 rounded-full">Shop Now</button>
        </div>
    )
}

const CartItemList = ({ products }) => {
    return (
        <div className="w-full md:w-2/3 sm:max-h-screen sm:overflow-y-auto scrollbar-thin flex flex-col gap-2">
            {products.map((product) => (
                <ProductItemCard
                    product={product}
                    actionButton={{
                        label: crossIcon,
                        func: () => null
                    }}
                />
            ))}
        </div>
    )
}

function Cart() {
    const products = [
        { id: 1, name: "Premium Wireless Headphones", price: "4,999", oldPrice: "6,999", category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", isSale: true },
        { id: 2, name: "Minimalist Leather Watch", price: "2,499", oldPrice: null, category: "Accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", isSale: false },
        { id: 3, name: "Smart Fitness Tracker", price: "3,200", oldPrice: "3,999", category: "Wearables", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500", isSale: true },
        { id: 4, name: "Portable Bluetooth Speaker", price: "1,850", oldPrice: null, category: "Electronics", image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500", isSale: false },
        { id: 5, name: "Organic Cotton T-Shirt", price: "899", oldPrice: "1,200", category: "Apparel", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", isSale: false },
        { id: 6, name: "Designer Sunglasses", price: "1,500", oldPrice: "2,500", category: "Accessories", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500", isSale: true },
    ];

    return (
        products.length === 0 ? <CartIsEmpty /> :
            <section className="flex flex-col-reverse sm:flex-row gap-2 border">
                <CartItemList products={products} />
                <OrderSummery type="cart" />
            </section>
    );
}

export default Cart;