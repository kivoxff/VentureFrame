import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import OrderSummary from "../../components/orders/OrderSummary";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const BillingAddress = ({ address }) => {
  return (
    <div className="p-3 flex-1 border rounded-2xl">
      <h3 className="text-xl font-bold mb-3">Billing address</h3>

      <p className="flex mb-2">
        <span className="w-24 shrink-0 font-semibold">Name</span>
        <span className="break-all">{address.name}</span>
      </p>

      <p className="flex mb-2">
        <span className="w-24 shrink-0 font-semibold">Email</span>
        <span className="break-all">{address.email}</span>
      </p>

      <p className="flex mb-2">
        <span className="w-24 shrink-0 font-semibold">Address</span>
        <span className="break-all">
          {`${address.street}, ${address.city} - ${address.pin}`}
        </span>
      </p>
    </div>
  );
};

function OrderDetails() {
  const [order, setOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { oid } = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!oid) return;

      const orderRef = doc(db, "orders", oid);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();

        setOrder({
          id: data.orderId,
          customer: data.customerName,
          status: data.currentStatus,
          amount: data.totalAmount,
          discount: data.discountAmount,
          date: data.createdAt?.toDate().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),

          payment: data.paymentMethod,
          addressInfo: {
            name: data.address.firstName + " " + data.address.lastName,
            email: data.address.email,
            street: data.address.street,
            city: data.address.city,
            pin: data.address.pinCode,
          },

          // ✅ TRANSFORM ITEMS HERE
          items: data.items.map((item) => ({
            id: item.productId,
            name: item.title,

            // normalize fields
            salePrice: item.price,
            qty: item.quantity,
            img: item.image,
          })),
        });
      }
    };

    fetchOrder();
  }, [oid]);

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true); // start loading

      const updateOrder = httpsCallable(functions, "updateOrder");

      await updateOrder({
        orderId: oid,
        action: newStatus,
      });

      // update UI instantly
      setOrder((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsUpdating(false); // stop loading
    }
  };

  if (!order) {
    return <h1 className="text-center">Loading...</h1>;
  }

  return (
    <section className="mx-auto max-w-7xl">
      <FloatingNavButtons />

      {/* Order Details */}
      <div className="p-3 border rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Order Details</h3>
            <span className="mr-1 text-xs text-gray-400">
              Order ID: {order.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="p-2 text-sm bg-gray-200 text-green-600 text-center font-semibold rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="PENDING" className="text-yellow-500 bg-gray-100">
                Pending
              </option>
              <option value="SHIPPED" className="text-blue-600 bg-gray-100">
                Shipped
              </option>
              <option value="DELIVERED" className="text-green-600 bg-gray-100">
                Delivered
              </option>
              <option value="CANCELLED" className="text-red-600 bg-gray-100">
                Cancelled
              </option>
            </select>

            {isUpdating && (
              <span className="text-xs text-gray-500">Updating...</span>
            )}
          </div>
        </div>

        <div className="mt-1 flex gap-5">
          <p className="text-xs text-gray-500">Placed on: {order.date}</p>
          <p className="text-xs text-gray-500"> Payment: {order.payment}</p>
        </div>
      </div>

      {/* Address & Price */}
      <div className="mt-2 flex flex-wrap sm:flex-nowrap gap-2">
        <BillingAddress address={order.addressInfo} />

        {/* price */}
        <OrderSummary products={order.items} discount={order.discount} />
      </div>

      {/* Orders Items */}
      <div className="mt-2 p-3 border rounded-2xl">
        <h3 className="text-xl font-bold">Order Items</h3>

        <div>
          {order.items.map((item) => (
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={item.img}
                  alt="image"
                  className="w-16 aspect-square border rounded-2xl"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-xs text-gray-500">Oty: {item.qty}</span>
                </div>
              </div>
              <span className="font-semibold">₹{item.salePrice}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrderDetails;
