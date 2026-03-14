import DashboardLayout from "../../components/layout/DashboardLayout";
import AppLayout from "../../components/layout/AppLayout";

function Seller() {
    const sellerMenu = [
        { label: "Dashboard", icon: "📊", path: "/seller-dashboard" },
        { label: "Orders", icon: "📦", path: "/seller-dashboard/orders" },
        { label: "Products", icon: "👕", path: "/seller-dashboard/products" }
    ];

    return (
        <AppLayout>
            <DashboardLayout menuItems={sellerMenu} />
        </AppLayout>
    )
}

export default Seller;