import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import ProductDetails from "./pages/product-details/ProductDetails";
import ProductList from "./pages/product-list/ProductList";
import Cart from "./pages/cart/Cart";
import Payment from "./pages/checkout/components/Payment";
import Checkout from "./pages/checkout/Checkout";
import Orders from "./pages/orders/Orders";
import OrderDetails from "./pages/orders/OrderDetails";
import Test from "./pages/Test";
import Admin from "./pages/admin/Admin";
import AdminDashboard from "./pages/admin/components/AdminDashboard";
import ManageSellers from "./pages/admin/components/manage-sellers/ManageSellers";
import ManageUsers from "./pages/admin/components/ManageUsers";
import StoreManager from "./pages/admin/components/store-manager/StoreManager";
import Seller from "./pages/seller/Seller";
import SellerDashboard from "./pages/seller/components/SellerDashboard";
import SellerOrders from "./pages/seller/components/SellerOrders";
import SellerProducts from "./pages/seller/components/SellerProducts";
import SellerApply from "./pages/seller/components/SellerApply";
import UserProfile from "./pages/profile/UserProfile";
import SellerProfile from "./pages/profile/SellerProfile";
import ProductsManager from "./components/products/ProductsManager";
import OrdersManager from "./components/orders/OrdersManager";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product-details/:pid" element={<ProductDetails />} />
      <Route path="/product-list" element={<ProductList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders/:uid" element={<Orders />} />
      <Route path="/order-details/:oid" element={<OrderDetails />} />
      <Route path="/seller-apply" element={<SellerApply />} />

      <Route path="/admin-dashboard" element={<Admin />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<OrdersManager source={"admin"} />} />
        <Route path="products" element={<ProductsManager source={"admin"} />} />
        <Route path="sellers" element={<ManageSellers />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="store-manager" element={<StoreManager />} />
      </Route>

      <Route path="seller-dashboard" element={<Seller />}>
        <Route index element={<SellerDashboard />} />
        <Route path="orders" element={<OrdersManager source={"seller"} />} />
        <Route path="products" element={<ProductsManager source={"seller"} />} />
      </Route>
      <Route path="/profile/user/:uid" element={<UserProfile />} />
      <Route path="/profile/seller/:sid" element={<SellerProfile />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;
