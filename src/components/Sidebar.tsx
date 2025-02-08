import { NavLink } from "react-router-dom";
import { BiTask } from "react-icons/bi";
import { FaUsersCog } from "react-icons/fa";
import { LuPackageSearch } from "react-icons/lu";
import { SiMicrosoftexcel } from "react-icons/si";
import { MdOutlineSettings } from "react-icons/md";
import { TbReport, TbPackageExport, TbPackageImport } from "react-icons/tb";
import { useAuth } from "../contexts/AuthContext";

const ROLES = ["executive", "admin", "manager", "root"];

const isAuthz = (current: string, required: string): boolean => {
    return ROLES.indexOf(current) >= ROLES.indexOf(required);
}

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const { user } = useAuth();

    return (
        <div className={`pt-16 text-white bg-slate-900 ${!isCollapsed && "w-52"}`}>
            <ul>
                {isAuthz(user?.role as string, "executive") && <NavLink to="/outgoing" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <TbPackageImport />
                        <div className={`${isCollapsed && "hidden"}`}>Outgoing Tasks</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "executive") && <NavLink to="/incoming" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <TbPackageExport />
                        <div className={`${isCollapsed && "hidden"}`}>Incoming Tasks</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "admin") && <NavLink to="/tasks" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <BiTask />
                        <div className={`${isCollapsed && "hidden"}`}>Manage Tasks</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "admin") && <NavLink to="/packages" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <LuPackageSearch />
                        <div className={`${isCollapsed && "hidden"}`}>Search Package</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "manager") && <NavLink to="/users" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <FaUsersCog />
                        <div className={`${isCollapsed && "hidden"}`}>Manage Users</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "admin") && <NavLink to="/config" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <MdOutlineSettings />
                        <div className={`${isCollapsed && "hidden"}`}>System Config</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "admin") && <div className="h-[1px] bg-gray-500 mx-4 my-2 rounded-full"></div>}
                {isAuthz(user?.role as string, "admin") && <NavLink to="/reports" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <TbReport />
                        <div className={`${isCollapsed && "hidden"}`}>Generate Report</div>
                    </li>
                </NavLink>}
                {isAuthz(user?.role as string, "admin") && <NavLink to="/reconcile" className={({ isActive }) => isActive ? "bg-white text-black" : ""}>
                    <li className={`flex items-center gap-2 bg-inherit ${isCollapsed ? "rounded-full p-4 mx-2" : "px-6 py-4"}`}>
                        <SiMicrosoftexcel />
                        <div className={`${isCollapsed && "hidden"}`}>Reconciliation</div>
                    </li>
                </NavLink>}
            </ul>
        </div>
    );
}

export default Sidebar;
