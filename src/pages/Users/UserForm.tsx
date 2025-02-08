import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { CODE } from "../../utils/response";

const UserForm = () => {
    const { action } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const isUpdate: boolean = (action === "update");

    const [formData, setFormData] = useState({
        name: isUpdate ? location.state.name : "",
        role: isUpdate ? location.state.role : "",
        username: isUpdate ? location.state.username : "",
        password: isUpdate ? location.state.password : ""
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (formData.password === "") delete formData.password;
        try {
            const response = await fetch(new URL(`/v1/users/${isUpdate ? location.state._id : ""}`, import.meta.env.VITE_API_BASE_URL), {
                method: isUpdate ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message);
                if (response.status === 401) logout();
                console.error(`Request to ${isUpdate ? "PATCH" : "POST"}:/v1/users failed with status ${response.status}`, response);
                return;
            }
            toast.success(`User ${isUpdate ? "updated" : "created"}`);
            navigate("/users");
        } catch (err) {
            console.error(`Request to ${isUpdate ? "PATCH" : "POST"}:/v1/users failed with error ${err}`);
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        });
    }

    return (
        <div className="p-8">
            <div className="mb-6 text-2xl font-bold">{isUpdate ? "Update User" : "Create User"}</div>
            <form onSubmit={handleSubmit}>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="name">Name</label>
                    </div>
                    <input
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    />
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="username">Username</label>
                    </div>
                    <input
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    />
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="password">Password</label>
                    </div>
                    <input
                        name="password"
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!isUpdate}
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    />
                </div>
                <div className="flex mb-8">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="role">Role</label>
                    </div>
                    <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    >
                        <option value="" hidden></option>
                        <option value="executive">Executive</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="root">Root</option>
                    </select>
                </div>
                <button className="btn-primary" type="submit">
                    {isUpdate ? "Update User" : "Create User"}
                </button>
            </form>
        </div>
    );

}

export default UserForm;
