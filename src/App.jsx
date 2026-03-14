import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import ProductDetails from "./pages/product-details/ProductDetails";
import ProductList from "./pages/product-list/ProductList";
import Cart from "./pages/cart/cart";
import Checkout from "./pages/checkout/Checkout";
import Orders from "./pages/orders/Orders";
import OrderDetails from "./pages/orders/OrderDetails";
import Test from "./pages/Test";
import Admin from "./pages/admin/Admin";
import AdminDashboard from "./pages/admin/components/AdminDashboard";
import AdminOrders from "./pages/admin/components/AdminOrders";
import AdminProducts from "./pages/admin/components/AdminProducts";
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

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product-details/:pid" element={<ProductDetails />} />
      <Route path="/product-list" element={<ProductList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/order-details" element={<OrderDetails />} />
      <Route path="/seller-apply" element={<SellerApply />} />

      <Route path="/admin-dashboard" element={<Admin />} >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="sellers" element={<ManageSellers />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="store-manager" element={<StoreManager />} />
      </Route>

      <Route path="seller-dashboard" element={<Seller />}>
        <Route index element={<SellerDashboard />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="products" element={<SellerProducts />} />
      </Route>
      <Route path="/profile/user/:uid" element={<UserProfile />} />
      <Route path="/profile/seller/:sid" element={<SellerProfile />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  )
}

export default App
