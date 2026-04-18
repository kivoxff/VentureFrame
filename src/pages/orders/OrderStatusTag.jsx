const OrderStatusTag = ({ status }) => {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-600",
    SHIPPED: "bg-blue-100 text-blue-600",
    DELIVERED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-3 py-1 text-sm rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
};

export default OrderStatusTag;
