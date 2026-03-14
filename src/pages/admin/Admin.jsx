import DashboardLayout from "../../components/layout/DashboardLayout";
import AppLayout from "../../components/layout/AppLayout";

const adminMenu = [
  { label: "Dashboard", icon: "📊", path: "/admin-dashboard" },
  { label: "Orders", icon: "📦", path: "/admin-dashboard/orders" },
  { label: "Products", icon: "👕", path: "/admin-dashboard/products" },
  { label: "Sellers", icon: "🏪", path: "/admin-dashboard/sellers" },
  { label: "Users", icon: "👤", path: "/admin-dashboard/users" },
  { label: "Store", icon: "🏪", path: "/admin-dashboard/store-manager" }
];

function Admin() {
  return (
    <AppLayout >
      <DashboardLayout menuItems={adminMenu} />
    </AppLayout>
  );
}

export default Admin;