import BillingAddress from "../../../components/orders/BillingAddress";

function OrderSuccess() {
    return (
        <div className="w-full sm:flex-1 flex flex-col h-fit gap-3 border">
            <div>
                <h2 className="text-5xl text-rose-700 font-bold">Thank you for your purchase!</h2>
                <p className="mt-6 text-gray-400">Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.</p>
            </div>
            
            <BillingAddress />

            <button className="p-3 bg-violet-700 hover:bg-violet-600 rounded-full text-white font-bold">My Orders</button>
        </div>
    )
}

export default OrderSuccess;