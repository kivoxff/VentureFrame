import { useEffect, useState } from "react";
import ResourceTable from "../tables/ResourceTable";
import { useAuth } from "../../context/AuthContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

function OrdersManager({source}) {
  // const orders = [
  //     {
  //         id: "ODR-001",
  //         customer: "Bob D.",
  //         status: "Pending",
  //         amount: "₹999",
  //         date: "2026-01-02",
  //     },
  //     {
  //         id: "ODR-002",
  //         customer: "Alice M.",
  //         status: "Completed",
  //         amount: "₹1,499",
  //         date: "2026-01-01",
  //     },
  //     {
  //         id: "ODR-003",
  //         customer: "Rahul S.",
  //         status: "Pending",
  //         amount: "₹799",
  //         date: "2025-12-30",
  //     },
  //     {
  //         id: "ODR-004",
  //         customer: "John K.",
  //         status: "Cancelled",
  //         amount: "₹2,299",
  //         date: "2025-12-28",
  //     },
  // ];

  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const ordersRef = collection(db, "orders");

    const q =
      source === "seller" && user?.sellerId
        ? query(ordersRef, where("sellerId", "==", user.sellerId))
        : ordersRef;

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => {
        const order = doc.data();

        return {
          id: order.orderId,
          customer: order.customerName,
          status: order.status,
          amount: `₹${order.totalAmount}`,
          date: order.createdAt?.toDate().toLocaleDateString(),
        };
      });

      setOrders(data);
    });

    return unsubscribe;
  }, [source, user]);

  const headers = [
    { label: "Order ID", key: "id" },
    { label: "Customer", key: "customer" },
    { label: "Status", key: "status" },
    { label: "Amount", key: "amount" },
    { label: "Date", key: "date" },
    { label: "Details", key: "details" },
  ];

  const rowActions = [
    {
      label: "View",
      func: (row) => navigate(`/order-details/${row.id}`),
    },
  ];

  return (
    <ResourceTable
      data={orders}
      headers={headers}
      rowActions={rowActions}
      filterOptions={["All", "Completed", "Pending", "Cancelled"]}
      searchKeys={["id", "customer"]}
      title={"Orders"}
      placeHolder={"Search by Order ID or Customer"}
    />
  );
}

export default OrdersManager;
