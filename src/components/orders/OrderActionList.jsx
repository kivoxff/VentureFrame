import React from "react";

function OrderActionList({ orders, viewClick, shippedClick, deliveredClick, cancelClick }) {

  return (
    orders.length !== 0 && (
      <div className="mb-4 px-3 py-2 rounded-xl border bg-white shadow-xl">
        <div className="flex gap-3 items-center">
          <h3 className="text-lg font-semibold">Orders Needing Action</h3>
          <span className="px-3 py-1 text-xs bg-yellow-100 text-rose-600 font-semibold border rounded-full">
            {orders.length} needs action
          </span>
        </div>

        {/* cards */}
        <div className="flex flex-wrap gap-2">
          {orders.map((order) => {
            const isPending = order.currentStatus === "PENDING";
            const isShipped = order.currentStatus === "SHIPPED";

            return (
              <div key={order.orderId} className="mt-4 p-2 w-80 border rounded-2xl flex-1">
                <div className="flex gap-2 justify-between">
                  <span className="font-semibold text-xl line-clamp-1">{order.customerName}</span>
                  <span className="p-1 flex justify-center items-center bg-pink-100 rounded-md text-xs text-pink-700 font-semibold">
                    {order.orderId}
                  </span>
                </div>

                <div className="mt-1 flex gap-2">
                  <span className="w-5">📦</span>
                  <span className="text-gray-500">{order.email}</span>
                </div>

                <div className="mt-2 flex gap-2 text-sm">
                  <button
                    onClick={() => viewClick(order)}
                    className="p-2 w-full border rounded-full font-semibold hover:bg-blue-50 text-blue-600 text-nowrap transition-colors"
                  >
                    View Details
                  </button>
                  {/* Cancel is always available before delivery */}
                  <button
                    onClick={() => cancelClick(order)}
                    className="p-2 w-full border rounded-full font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Cancel Order
                  </button>
                </div>
                
                {isPending && (
                  <button
                    onClick={() => shippedClick(order.orderId, "SHIPPED")}
                    className="mt-2 p-2 w-full border rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Mark Shipped
                  </button>
                )}

                {isShipped && (
                  <button
                    onClick={() => deliveredClick(order.orderId, "DELIVERED")}
                    className="mt-2 p-2 w-full border rounded-full font-semibold text-white bg-green-600 hover:bg-green-700"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}

export default OrderActionList;