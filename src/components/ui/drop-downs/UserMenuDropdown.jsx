import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


function UserMenuDropdown() {
    const { user, logoutUser: logOut } = useAuth();

    return (
        <div className="p-2 max-h-40 absolute top-full right-0 z-10 border overflow-y-auto bg-white text-nowrap rounded-md shadow-xl scrollbar-thin flex flex-col">
            <Link to={`/profile/user/${user?.userId}`} className="p-1 hover:bg-blue-50">Profile</Link>
            <Link to={"/admin-dashboard"} className="p-1 hover:bg-blue-50">Admin Dashboard</Link>
            <button onClick={() => logOut()} className="p-1 hover:bg-blue-50 text-red-500 border-t">Log Out</button>
        </div>
    )
}

export default UserMenuDropdown;