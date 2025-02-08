import { FaUser, FaUserTie, FaUserCog, FaUserSecret } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { useAuth } from "../contexts/AuthContext";
import Latency from "./Latency";
import logo from "../assets/logo.webp";

const Navbar = ({ setIsCollapsed }: { setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) => {

    const { user, logout } = useAuth();

    return (
        <nav className="flex items-center justify-between h-16 transition-colors shadow px-7">
            <div className="flex items-center h-full py-2">
                <button onClick={() => { setIsCollapsed(prev => !prev) }} className="p-2 text-lg transition-colors rounded-full outline-none hover:bg-neutral-100 active:bg-neutral-200"><IoMdMenu /></button>
                <img src={logo} alt="staranddaisy" className="h-full ml-2" />
            </div>
            <div className="flex items-center gap-x-8">
                <Latency />
                <div className="flex items-center gap-x-2">
                    <div className="p-2 text-xl rounded-full bg-neutral-200 text-neutral-800">
                        {[<FaUser />, <FaUserTie />, <FaUserCog />, <FaUserSecret />][["executive", "admin", "manager", "root"].indexOf(user?.role || "executive")]}
                    </div>
                    <div>
                        <div className="mb-0 font-bold leading-tight">{user?.name}</div>
                        <div className="text-sm font-medium leading-none text-neutral-600">{user?.username}</div>
                    </div>
                </div>
                <button onClick={() => { logout(); }} className="px-4 py-2 text-red-600 transition-colors border border-red-600 rounded hover:text-white hover:bg-red-600">Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;
