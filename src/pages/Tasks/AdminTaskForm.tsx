import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import { CODE } from "../../utils/response";

const AdminTaskForm = () => {
    const location = useLocation();
    const { action } = useParams();
    const navigate = useNavigate();
    const { config } = useConfig();
    const { token, logout } = useAuth();
    const isUpdate: boolean = (action === "update");

    const [formData, setFormData] = useState({
        courier: isUpdate ? location.state.courier : "",
        channel: isUpdate ? location.state.channel : "",
        is_open: isUpdate ? location.state.is_open : true,
        type: isUpdate ? location.state.type : "",
        vehicle_no: isUpdate ? location.state.vehicle_no : "",
        delex_name: isUpdate ? location.state.delex_name : "",
        delex_contact: isUpdate ? location.state.delex_contact : ""
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch(new URL(`/v1/tasks/${isUpdate ? location.state._id : ""}`, import.meta.env.VITE_API_BASE_URL), {
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
                console.error(`Request to ${isUpdate ? "PATCH" : "POST"}:/v1/tasks failed with status ${response.status}`, response);
                return;
            }
            toast.success(`Task ${isUpdate ? "updated" : "created"}`);
            navigate("/tasks");
        } catch (err) {
            console.error(`Request to ${isUpdate ? "PATCH" : "POST"}:/v1/tasks failed with error ${err}`);
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
            <div className="mb-6 text-2xl font-bold">{isUpdate ? "Update Task" : "Create Task"}</div>
            <form onSubmit={handleSubmit}>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="channel">Channel</label>
                    </div>
                    <select
                        name="channel"
                        id="channel"
                        value={formData.channel}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    >
                        <option value="" hidden>Select</option>
                        {config.channel?.map(item => {
                            return <option value={item}>{item}</option>
                        })}
                    </select>
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="courier">Courier</label>
                    </div>
                    <select
                        name="courier"
                        id="courier"
                        value={formData.courier}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    >
                        <option value="" hidden>Select</option>
                        {config.courier?.map(item => {
                            return <option value={item}>{item}</option>
                        })}
                    </select>
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="type">Type</label>
                    </div>
                    <select
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    >
                        <option value="" hidden>Select</option>
                        <option value="outgoing">Outgoing</option>
                        <option value="incoming">Incoming</option>
                    </select>
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="is_open">Status</label>
                    </div>
                    <select
                        name="is_open"
                        id="is_open"
                        value={formData.is_open ? "true" : "false"}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                is_open: e.target.value === "true" ? true : false
                            }))
                        }}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    >
                        <option value="true">Open</option>
                        <option value="false">Closed</option>
                    </select>
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="vehicle_no">Vehicle No.</label>
                    </div>
                    <input
                        name="vehicle_no"
                        id="vehicle_no"
                        value={formData.vehicle_no}
                        onChange={handleInputChange}
                        pattern="^[A-Z]{2}[0-9]{1,2}(?:[A-Z])?(?:[A-Z]*)?[0-9]{4}$"
                        placeholder="Eg. UP14DC4356"
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    />
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="delex_name">Delivery Ex.</label>
                    </div>
                    <input
                        name="delex_name"
                        id="delex_name"
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        value={formData.delex_name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex mb-8">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="delex_contact">Delivery Ph.</label>
                    </div>
                    <input
                        name="delex_contact"
                        id="delex_contact"
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        value={formData.delex_contact}
                        onChange={handleInputChange}
                        pattern="^\d{10}$"
                        title="10-digit mobile number"
                        placeholder="Eg. 9878767658"
                    />
                </div>
                <button className="btn-primary" type="submit">
                    {isUpdate ? "Update Task" : "Create Task"}
                </button>
            </form>
        </div>
    );

}

export default AdminTaskForm;
