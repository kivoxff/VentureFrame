import { useDispatch } from "react-redux";
import cartIcon from "../../../assets/icons/addToCart.svg";
import { useAuth } from "../../../context/AuthContext";
import { addToCart } from "../../../redux/cart/cartSlice";

const ListCard = ({ product }) => {

const { user } = useAuth();
const dispatch = useDispatch();

const handleAddToCart = (e) => {
  e.preventDefault(); // prevent link navigation
  e.stopPropagation();

  dispatch(addToCart({uid: user?.userId, item: product}));
};


  const isSale = product.salePrice && product.mrp > product.salePrice;
  return (
    <div className="px-2 mb-4 flex shrink-0 min-w-44 w-1/2 sm:w-1/3 lg:w-1/4">
      {/* Actual Card Body */}
      <div className="group flex flex-col w-full bg-white rounded-2xl md:rounded-3xl p-2 md:p-3 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
        {/* Top Left: Circular Add to Cart Button */}
        <button 
        onClick={handleAddToCart}
        className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center justify-center w-8 h-8 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full shadow-sm border border-transparent hover:bg-violet-600 hover:border-violet-600 hover:text-white transition-all duration-300 group/btn">
          <img
            src={cartIcon}
            alt="Add to Cart"
            className="w-4 h-4 md:w-5 md:h-5 transition-all duration-300 group-hover/btn:invert group-hover/btn:brightness-0"
          />
        </button>

        {/* Top Right: Sale Badge */}
        {isSale && (
          <span className="absolute top-5 right-4 md:top-8 md:right-6 z-20 bg-red-500 text-white text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full tracking-widest uppercase shadow-sm">
            Sale
          </span>
        )}

        {/* Inset Product Image Container */}
        <div className="relative flex items-center justify-center h-40 md:h-64 bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden w-full">
          <img
            src={product.thumbnails}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col grow px-2 md:px-3 pt-3 md:pt-5 pb-2">
          {/* Company & Rating */}
          <div className="flex justify-between items-center mb-1 md:mb-2">
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 uppercase truncate pr-2">
              {product.company}
            </span>
            <div className="flex items-center text-[10px] md:text-xs font-bold text-gray-700 shrink-0">
              <span className="text-yellow-400 mr-0.5 md:mr-1 text-xs md:text-sm">
                ★
              </span>
              4.0
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm md:text-lg font-bold text-gray-900 leading-tight md:leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Spacer to push pricing to the bottom */}
          <div className="grow"></div>

          {/* Pricing Layout */}
          <div className="flex flex-wrap items-end gap-1 md:gap-2 mt-2 pt-2 md:mt-3 md:pt-3 border-t border-gray-50">
            <span className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">
              ₹{product.salePrice}
            </span>
            {product.mrp && (
              <span className="text-xs md:text-sm font-semibold text-gray-400 line-through mb-0.5 md:mb-1">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCard;