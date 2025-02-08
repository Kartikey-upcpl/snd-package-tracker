import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Auth/Login";
import Users from "./pages/Users";
import UserForm from "./pages/Users/UserForm";
import Tasks from "./pages/Tasks";
import OpenTasks from "./pages/Tasks/OpenTasks";
import TaskDetail from "./pages/Tasks/TaskDetail";
import AdminTaskForm from "./pages/Tasks/AdminTaskForm";
import ExecutiveTaskForm from "./pages/Tasks/ExecutiveTaskForm";
import Scanning from "./pages/Scanning";
import Packages from "./pages/Packages";
import Config from "./pages/Config";
import Reports from "./pages/Reports";
import Reconciliation from "./pages/Reconciliation";

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/outgoing" />} />
                <Route path="/login" element={<Login />} />
                <Route element={<DashboardLayout />}>
                    <Route path="/outgoing/create" element={<ExecutiveTaskForm />} />

                    <Route path="/incoming/:id" element={<Scanning />} />
                    <Route path="/incoming/create" element={<ExecutiveTaskForm />} />

                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/incoming" element={<OpenTasks />} />
                    <Route path="/outgoing/:id" element={<Scanning />} />
                    <Route path="/tasks/:action/:id?" element={<AdminTaskForm />} />
                    <Route path="/tasks/view/:id" element={<TaskDetail />} />

                    <Route path="/outgoing" element={<OpenTasks />} />
                    <Route path="/users/:action/:id?" element={<UserForm />} />
                    <Route path="/users" element={<Users />} />

                    <Route path="/config" element={<Config />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/reconcile" element={<Reconciliation />} />
                </Route>
                <Route path="*" element={<>Page Not Found</>} />
            </Routes>
            <Toaster />
        </>
    );
}

export default App;
