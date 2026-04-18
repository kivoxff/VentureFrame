import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";

function Orders() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!uid) return;
      try {
        const q = query(collection(db, "orders"), where("userId", "==", uid));

        const snapshot = await getDocs(q);

        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            orderId: data.orderId,
            status: data.currentStatus,
            amount: data.totalAmount,
            discount: data.discountAmount,

            date: data.createdAt?.toDate().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),

            payment: data.paymentMethod,
          };
        });

        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [uid]);

  if (loading) {
    return <h1 className="text-center py-10">Loading...</h1>;
  }

  if (orders.length === 0) {
    return (
      <section className="mx-auto max-w-7xl">
        <FloatingNavButtons />
        <p className="text-center py-10 text-gray-500">
          No orders found for this user.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
      <FloatingNavButtons />

      {orders.map((order) => (
        <div key={order.id} className="mb-2 p-2 border rounded-2xl">
          {/* Top */}
          <div className="p-3 flex flex-wrap gap-3 justify-between items-center border-b">
            <p className="flex flex-col">
              <span className="text-xs text-gray-400">Order ID</span>
              <span className="text-sm font-semibold">{order.orderId}</span>
            </p>

            <p className="flex flex-col">
              <span className="text-xs text-gray-400">Placed On</span>
              <span className="text-sm font-semibold">{order.date}</span>
            </p>

            <select
              
              name="status"
              className="p-2 text-sm bg-gray-200 text-green-600 text-center font-semibold rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="delivered" className="text-green-600 bg-gray-100">
                Delivered
              </option>
              <option value="pending" className="text-yellow-600 bg-gray-100">
                Pending
              </option>
              <option value="pending" className="text-yellow-600 bg-gray-100">
                cancled
              </option>
            </select>
          </div>

          {/* Bottom */}
          <div className="p-3 flex justify-between items-center">
            <p>
              <span className="mr-1 font-semibold">Total:</span>
              <span className="font-semibold text-violet-700">
                ₹{order.amount}
              </span>
            </p>

            <button
              onClick={() => navigate(`/order-details/${order.id}`)}
              className="text-xs text-violet-700 hover:underline"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Orders;
