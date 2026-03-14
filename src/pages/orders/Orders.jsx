import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";

function Orders() {
  return (
    <section className="mx-auto max-w-7xl">
      <FloatingNavButtons />

      <div className="mb-2 p-2 border rounded-2xl">
        <div className="p-3 flex flex-wrap gap-3 justify-between items-center border-b">
          <p className="flex flex-col">
            <span className="text-xs text-gray-400">Order ID</span>
            <span className="text-sm font-semibold">ORD-10231</span>
          </p>

          <p className="flex flex-col">
            <span className="text-xs text-gray-400">Placed On</span>
            <span className="text-sm font-semibold">12 Sep 2025</span>
          </p>

          <select name="status" className="p-2 text-sm bg-gray-200 text-green-600 text-center font-semibold rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="delivered" className="text-green-600 bg-gray-100">
              Delivered
            </option>
            <option value="pending" className="text-yellow-600 bg-gray-100">
              Pending
            </option>
          </select>
        </div>

        <div className="p-3 flex justify-between items-center">
          <p>
            <span className="mr-1 font-semibold">Total:</span>
            <span className="font-semibold text-violet-700">₹999</span>
          </p>

          <button className="text-xs text-violet-700 hover:underline">View Details</button>
        </div>
      </div>
    </section>
  )
}

export default Orders;