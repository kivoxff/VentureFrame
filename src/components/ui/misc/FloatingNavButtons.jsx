import { useNavigate } from "react-router-dom";
import lessThanIcon from "../../../assets/icons/lessThan.svg";
import greaterThanIcon from "../../../assets/icons/greaterThan.svg";

const FloatingNavButtons = ({ className = "" }) => {
    const navigate = useNavigate();

    return (
        <div className="p-1.5 flex items-center fixed right-7 bottom-7 bg-white border border-gray-300 rounded-2xl shadow-xl">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                title="Back"
                className={`p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 
                transition flex items-center justify-center ${className}`}>
                <img src={lessThanIcon} />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Next Button */}
            <button
                onClick={() => navigate(+1)}
                title="Next"
                className={`p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 
                transition flex items-center justify-center ${className}`}>
                <img src={greaterThanIcon} />
            </button>
        </div>
    );
};

export default FloatingNavButtons;
