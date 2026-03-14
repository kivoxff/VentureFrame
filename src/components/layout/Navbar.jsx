import { Link } from "react-router-dom";
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

function Navbar() {
  const data = [
    { name: "T-Shirt", img: sellerIcon },
    { name: "Casual Shirt", img: sellerIcon },
    { name: "Formal Shirt", img: sellerIcon },
    { name: "Jeans", img: sellerIcon },
    { name: "Denim Jacket", img: sellerIcon },
    { name: "Hoodie", img: sellerIcon },
    { name: "Sweatshirt", img: sellerIcon },
    { name: "Track Pants", img: sellerIcon },
    { name: "Shorts", img: sellerIcon },
    { name: "Leather Jacket", img: sellerIcon },
    { name: "Blazer", img: sellerIcon },
    { name: "Kurta", img: sellerIcon },
    { name: "Pyjama", img: sellerIcon },
    { name: "Cargo Pants", img: sellerIcon },
    { name: "Joggers", img: sellerIcon },
  ];

  const [searchVal, setSearchVal] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { user, hasRole, googleLogin: login, authLoading } = useAuth();
  const firstName = user?.displayName?.split(" ").at(0) || "Account";
  const isSeller = hasRole("seller");

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

  const handleLoginClick = () => {
    if (!user) {
      login();
      setShowDropdown(false);
      return;
    }

    setShowDropdown((prev) => !prev);
  };

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
            value={searchVal}
            autoFocus
            type="text"
            placeholder="Search Products"
            className="peer pl-1 w-full h-2/3 border border-gray-400 rounded-r-full outline-none"
          />

          {/* Dropdown Suggestions */}
          {searchVal && <SearchDropdown data={data} searchVal={searchVal} />}
        </div>
      )}

      {/* Right Part */}
      {!showSearch && (
        <div className="w-60 sm:w-auto h-full flex justify-between items-center gap-4 border">
          {/* Desktop Search Bar */}
          <div className="hidden h-full sm:flex items-center border relative">
            <button className="p-1.5 w-10 h-2/3 border rounded-l-full border-gray-400 bg-gray-100 hover:bg-gray-200">
              <img src={searchIcon} alt="search" className="w-full h-full" />
            </button>
            <input
              onChange={(e) => setSearchVal(e.target.value)}
              value={searchVal}
              type="text"
              placeholder="Search Products"
              className="peer pl-1 w-40 md:w-60 h-2/3 border border-gray-400 rounded-r-full outline-none"
            />

            {/* Dropdown Suggestions */}
            {searchVal && <SearchDropdown data={data} searchVal={searchVal} />}
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
              9+
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
