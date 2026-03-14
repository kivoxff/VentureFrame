import BillingAddress from "../../components/orders/BillingAddress";
import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import OrderSummary from "../../components/orders/OrderSummary";

function OrderDetails() {
    return (
        <section className="mx-auto max-w-7xl">
            <FloatingNavButtons />

            {/* Order Details */}
            <div className="p-3 border rounded-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Order Details</h3>
                        <span className="mr-1 text-xs text-gray-400">Order ID: ORD-10231</span>
                    </div>
                    <select name="status" className="p-2 text-sm bg-gray-200 text-green-600 text-center font-semibold rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option value="delivered" className="text-green-600 bg-gray-100">
                            Delivered
                        </option>
                        <option value="pending" className="text-yellow-600 bg-gray-100">
                            Pending
                        </option>
                    </select>
                </div>

                <div className="mt-1 flex gap-5">
                    <p className="text-xs text-gray-500">Placed on: 12 Sep 2025</p>
                    <p className="text-xs text-gray-500">Payment: Cash on Delivery</p>
                </div>
            </div>

            {/* Address & Price */}
            <div className="mt-2 flex flex-wrap sm:flex-nowrap gap-2">
               <BillingAddress />

                {/* price */}
                <OrderSummary type="order-details" />
            </div>

            {/* Orders Items */}
            <div className="mt-2 p-3 border rounded-2xl">
                <h3 className="text-xl font-bold">Order Details</h3>

                <div>
                    <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <img src="" alt="" className="w-16 aspect-square border rounded-2xl" />
                            <div className="flex flex-col">
                                <span className="font-semibold">I Phone</span>
                                <span className="text-xs text-gray-500">Oty: 1</span>
                            </div>
                        </div>
                        <span className="font-semibold">₹9999</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OrderDetails;