import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "../../assets/images/logo.svg";
import sellerIcon from "../../assets/icons/seller.svg";
import cartIcon from "../../assets/icons/cart.svg";
import userIcon from "../../assets/icons/user.svg";
import searchIcon from "../../assets/icons/search.svg";
import crossIcon from "../../assets/icons/cross.svg";
import SearchDropdown from "../ui/drop-downs/SearchDropdown";
import UserMenuDropdown from "../ui/drop-downs/UserMenuDropdown";
import { useAuth } from "../../context/AuthContext";
import Loader from "../ui/misc/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartThunk } from "../../redux/cart/cartThunk";

function Navbar() {
  const [searchVal, setSearchVal] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { user, hasRole, googleLogin: login, authLoading } = useAuth();
  const firstName = user?.displayName?.split(" ").at(0) || "Account";
  const isSeller = hasRole("seller");

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const cartItemsCount = cartItems?.length > 9 ? "9+" : cartItems.length;

  useEffect(() => {
    // ouside click
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    dispatch(fetchCartThunk({ uid: user?.userId }));
  }, [user]);

  const handleLoginClick = () => {
    if (!user) {
      login();
      setShowDropdown(false);
      return;
    }

    setShowDropdown((prev) => !prev);
  };

  // Create the search handler
  const handleSearch = () => {
    if (searchVal.trim()) {
      // Redirects to /product-list?query=yourSearchTerm
      navigate(`/product-list?query=${encodeURIComponent(searchVal.trim())}`);
      setShowSearch(false); // Closes the mobile search bar after searching
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = (product) => {
    const {id} = product;
    navigate(`/product-details/${id}`);
  }

  return (
    <nav className="px-1 w-full h-16 flex justify-around items-center shadow-md border">
      {/* Logo */}
      <Link
        to={"/"}
        className="mr-3 w-20 h-full flex justify-center items-center border"
      >
        <img src={logo} alt="VentureFrame" className="w-full" />
      </Link>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="w-60 h-full flex items-center border relative">
          <button
            onClick={() => setShowSearch(false)}
            className="p-2 w-10 h-2/3 border rounded-l-full border-gray-400 bg-gray-100 hover:bg-gray-200"
          >
            <img src={crossIcon} alt="search" className="w-full h-full" />
          </button>
          <input
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleKeyDown}
            value={searchVal}
            autoFocus
            type="text"
            placeholder="Search Products"
            className="peer pl-1 w-full h-2/3 border border-gray-400 rounded-r-full outline-none"
          />

          {/* Dropdown Suggestions */}
          {searchVal && <SearchDropdown searchVal={searchVal} onSelect={handleSelect} />}
        </div>
      )}

      {/* Right Part */}
      {!showSearch && (
        <div className="w-60 sm:w-auto h-full flex justify-between items-center gap-4 border">
          {/* Desktop Search Bar */}
          <div className="hidden h-full sm:flex items-center border relative">
            <button
            onClick={handleSearch}
             className="p-1.5 w-10 h-2/3 border rounded-l-full border-gray-400 bg-gray-100 hover:bg-gray-200">
              <img src={searchIcon} alt="search" className="w-full h-full" />
            </button>
            <input
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={handleKeyDown}
              value={searchVal}
              type="text"
              placeholder="Search Products"
              className="peer pl-1 w-40 md:w-60 h-2/3 border border-gray-400 rounded-r-full outline-none"
            />

            {/* Dropdown Suggestions */}
            {searchVal && <SearchDropdown searchVal={searchVal} onSelect={handleSelect} />}
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="h-2/3 flex sm:hidden justify-center items-center border"
          >
            <img src={searchIcon} alt="Seller" className="w-7" />
          </button>

          {/* Feature Links */}
          <Link
            to={isSeller ? "/seller-dashboard" : "/seller-apply"}
            className="group h-2/3 flex flex-col justify-center items-center border"
          >
            <img src={sellerIcon} alt="Seller" className="w-7 md:w-5" />
            <span className="hidden w-24 md:flex justify-center text-xs font-semibold group-hover:text-orange-500">
              {isSeller ? "Seller Dashboard" : "Become a Seller"}
            </span>
          </Link>

          <Link
            to={"/cart"}
            className="group h-2/3 flex flex-col justify-center items-center border relative"
          >
            <div className="w-4 h-4 md:h-3.5 flex justify-center items-center absolute top-0 -right-1 md:-top-1 md:-right-1 bg-red-500 text-[10px] text-white font-medium font-mono rounded-full">
              {cartItemsCount}
            </div>
            <img src={cartIcon} alt="Seller" className="w-7 md:w-5" />
            <span className="hidden md:flex text-xs font-semibold group-hover:text-orange-500">
              Cart
            </span>
          </Link>

          {/* Login */}
          {/* onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)} */}
          <div
            ref={dropdownRef}
            className="h-full flex justify-center items-center relative"
          >
            {authLoading ? (
              <div className="w-18 h-2/3 flex justify-center items-center border rounded-full">
                <Loader size={30} />
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="group w-18 h-2/3 flex flex-col justify-center items-center border rounded-full hover:border-2 hover:border-orange-500"
              >
                <img
                  src={user?.photoURL || userIcon}
                  alt="Seller"
                  className="w-5 h-5 overflow-hidden rounded-full"
                />
                <span className="w-14 text-xs font-semibold group-hover:text-orange-500 truncate">
                  {user ? firstName : "Login"}
                </span>
              </button>
            )}

            {showDropdown && user && <UserMenuDropdown />}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
