import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MdOutlineEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import PageLoading from "../../components/PageLoading";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../contexts/AuthContext";
import { CODE } from "../../utils/response";
import { DDMMYYHHMMSS } from "../../utils/date";

const Users = () => {

    const { token, logout } = useAuth();

    const { response, loading, count, refresh } = useFetch<{ metadata: {}, data: TUser[] } | null>("/v1/users", null);

    const [userFilter, setUserFilter] = useState<{ user: string, role: string }>({
        user: "",
        role: ""
    });

    const handleDelete = async (id: string, username: string) => {
        if (prompt(`To confirm type "${username}" in the box below:`) === username) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/users/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    if (CODE[response.status]) toast.error(CODE[response.status].message);
                    if (response.status === 401) logout();
                    console.error(`Request to DELETE:/v1/users failed with status ${response.status}`, response);
                    return;
                }
                toast.success("User deleted");
                refresh();
            } catch (err) {
                console.error(`Request to DELETE:/v1/users failed with error ${err}`);
            }
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUserFilter(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        });
    }

    return (
        loading && count === 0 ? <PageLoading /> : <div className="p-8">
            <div className="flex justify-between mb-6">
                <div className="text-2xl font-bold">Manage Users</div>
                <div className="flex">
                    <div className="flex mr-2">
                        <div className="w-16 p-2 font-medium text-center border border-r-0 rounded-tl rounded-bl border-neutral-300 bg-neutral-100">
                            <label htmlFor="role">Role</label>
                        </div>
                        <select
                            name="role"
                            value={userFilter.role}
                            onChange={handleInputChange}
                            className="p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        >
                            <option value="">All</option>
                            <option value="executive">Executive</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="root">Root</option>
                        </select>
                    </div>
                    <input
                        type="search"
                        name="user"
                        placeholder="Search"
                        value={userFilter.user}
                        onChange={handleInputChange}
                        className="p-2 mr-8 border rounded outline-none border-neutral-300"
                    />
                    <Link to="create">
                        <button className="btn-primary">Create User</button>
                    </Link>
                </div>
            </div>
            <table className="w-full text-center">
                <thead className="border rounded-md bg-neutral-100 border-neutral-300">
                    <tr>
                        <th className="py-3">S.No.</th>
                        <th className="py-3">Username</th>
                        <th className="py-3">Name</th>
                        <th className="py-3">Role</th>
                        <th className="py-3">Updated At</th>
                        <th className="py-3">Created At</th>
                        <th className="py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-1"></td>
                    </tr>
                </tbody>
                <tbody>
                    {response && response.data
                        .filter(user => (user.username.includes(userFilter.user) || user.name.toLowerCase().includes(userFilter.user.toLowerCase())) && (!userFilter.role || user.role === userFilter.role))
                        .map((user, i) => {
                            return <tr key={user._id} className="border">
                                <td className="py-2">{i + 1}</td>
                                <td className="py-2">{user.username}</td>
                                <td className="py-2">{user.name}</td>
                                <td className="py-2">{user.role}</td>
                                <td className="py-2">{DDMMYYHHMMSS(user.updated_at)}</td>
                                <td className="py-2">{DDMMYYHHMMSS(user.created_at)}</td>
                                <td className="py-2">
                                    <Link to={`update/${user._id}`} state={user}>
                                        <button className="p-2 mr-1 text-white bg-blue-700 rounded-full"><MdOutlineEdit /></button>
                                    </Link>
                                    <button className="p-2 text-white bg-red-600 rounded-full" onClick={() => { handleDelete(user._id, user.username) }}>
                                        <FaRegTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        })}
                </tbody>
            </table>
        </div>
    );
}

export default Users;
