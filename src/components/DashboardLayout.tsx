import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

const DashboardLayout = () => {
    const { isAuthenticated } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    return (
        isAuthenticated() ?
            <div className="flex flex-col w-screen h-screen">
                <Navbar setIsCollapsed={setIsCollapsed} />
                <div className="flex h-[calc(100vh-4rem)]">
                    <Sidebar isCollapsed={isCollapsed} />
                    <main className={`${isCollapsed ? "w-full" : "w-[calc(100vw-13rem)]"} overflow-y-auto overflow-x-hidden`}>
                        <Outlet />
                    </main>
                </div>
            </div>
            :
            <Navigate to="/login" />
    );
}

export default DashboardLayout;
