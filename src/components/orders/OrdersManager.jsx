import { useNavigate } from "react-router-dom";
import ResourceTable from "../tables/ResourceTable";
import { db, functions } from "../../firebase/config";
import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import OrderActionList from "./OrderActionList";
import FeedbackModal from "../ui/misc/FeedbackModal";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { httpsCallable } from "firebase/functions";

function OrdersManager({ source }) {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (source !== "admin") return;

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("currentStatus", "in", ["PENDING", "SHIPPED"]),
      limit(20),
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const ordersData = snap.docs.map((doc) => doc.data());
        setOrders(ordersData);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOrderUpdate = async (orderId, actionStatus, reason = "") => {
    try {
      const updateOrder = httpsCallable(functions, "updateOrder");
      // Passing reason here in case you update your backend to save it later
      await updateOrder({ orderId, action: actionStatus, reason });
      toast.success(`Order successfully marked as ${actionStatus}`);
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const handleModalOpen = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderCancel = async ({ message }) => {
    if (!selectedOrder) return;

    await handleOrderUpdate(selectedOrder.orderId, "CANCELLED", message);
    handleModalClose();
  };

  const handleViewOrder = (row) => {
    navigate(`/order-details/${row.orderId}`);
  };

  const headers = [
    { key: "orderId", label: "Order ID", sortable: false },
    { key: "customerName", label: "Customer", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "paymentMethod", label: "Payment", sortable: true },
    { key: "totalAmount", label: "Total (₹)", sortable: true },
    { key: "currentStatus", label: "status", sortable: true },
    // { key: "createdAt", label: "Created At", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const customRenderers = {
    currentStatus: {
      rendererType: "statusDropdown",
      interactiveStatuses: [],
      statuses: [
        { label: "Pending", value: "PENDING" },
        { label: "Shipped", value: "SHIPPED" },
        { label: "Delivered", value: "DELIVERED" },
        { label: "Cancelled", value: "CANCELLED" },
      ],
    },

    actions: {
      rendererType: "actionButton",
      actions: [
        {
          label: "View",
          func: handleViewOrder,
        },
      ],
    },
  };

  const filters = [
    { label: "All", key: "ALL", value: "ALL" },

    { label: "Pending", key: "currentStatus", value: "PENDING" },
    { label: "Shipped", key: "currentStatus", value: "SHIPPED" },
    { label: "Delivered", key: "currentStatus", value: "DELIVERED" },
    { label: "Cancelled", key: "currentStatus", value: "CANCELLED" },
  ];

  const searchFields = [
    { label: "Order ID", key: "orderId" },
    { label: "Customer Name", key: "customerName" },
    { label: "Customer Email", key: "email" },
    { label: "City", key: "address.city" },
  ];

  return (
    <section>
      {source === "admin" && (
        <OrderActionList
          orders={orders}
          viewClick={handleViewOrder}
          shippedClick={handleOrderUpdate}
          deliveredClick={handleOrderUpdate}
          cancelClick={handleModalOpen} // Routes to modal instead of direct update
        />
      )}

      {isModalOpen && source === "admin" && (
        <FeedbackModal
          onClose={handleModalClose}
          title="Cancel Order"
          showRating={false}
          variant="danger"
          placeholder="Please explain the reason for cancelling this order..."
          submitLabel="Confirm Cancellation"
          onSubmit={handleOrderCancel}
        />
      )}

      <ResourceTable
        title={"Orders"}
        collectionName="orders"
        source={source}
        headers={headers}
        customRenderers={customRenderers}
        filters={filters}
        searchFields={searchFields}
      />
    </section>
  );
}

export default OrdersManager;
