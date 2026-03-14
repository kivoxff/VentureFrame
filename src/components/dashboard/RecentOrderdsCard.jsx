import { Link } from "react-router-dom";

function RecentOrdersCard({ OrdersData, redirectTo }) {
    return (
        <div className="mt-2 w-full sm:w-auto h-fit rounded-xl border bg-white shadow-xl grow-2">
            <div className="px-3 py-2 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Link to={redirectTo} className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>

            <div className="overflow-x-auto scrollbar-none">
                <table className="min-w-sm w-full">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 text-gray-500 text-left">Order ID</th>
                            <th className="px-3 py-2 text-gray-500 text-left">Customer</th>
                            <th className="px-3 py-2 text-gray-500 text-left">Status</th>
                            <th className="px-3 py-2 text-gray-500 text-left">Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            OrdersData.map((order) => (
                                <tr>
                                    <td className="px-3 py-2 text-xs sm:text-sm text-left font-semibold">{order.id}</td>
                                    <td className="px-3 py-2 text-xs sm:text-sm text-gray-500 text-left">{order.customer}</td>
                                    <td className="px-3 py-2 text-xs sm:text-sm text-left">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold 
                                            ${order.status === "Completed"
                                                ? "bg-green-100 text-green-700"
                                                : order.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : order.status === "Cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-700"}`}>{order.status}</span></td>
                                    <td className="px-3 py-2 text-xs sm:text-sm text-left font-semibold">{order.amount}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RecentOrdersCard;