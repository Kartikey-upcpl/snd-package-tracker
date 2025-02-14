import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import { CODE } from "../../utils/response";

const ExecutiveTaskForm = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { config } = useConfig();
    const { token, logout } = useAuth();
    const tasktype: ("outgoing" | "incoming") = location.pathname.split("/")[1] === "incoming" ? "incoming" : "outgoing";

    const [formData, setFormData] = useState({
        courier: "",
        channel: "",
        is_open: true,
        type: tasktype,
        vehicle_no: "",
        delex_name: "",
        delex_contact: "",
        packages: ""
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const packageList = formData.packages
                .split("\n")
                .map(id => id.trim())
                .filter(id => id); // Remove empty lines

            const response = await fetch(new URL("/v1/tasks/", import.meta.env.VITE_API_BASE_URL), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, packages: packageList }) // Send packages as an array
            });
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 400 && result.conflict_packages) {
                    toast.error(`Duplicate packages found: ${result.conflict_packages.join(", ")}`);
                } else if (CODE[response.status]) {
                    toast.error(CODE[response.status].message);
                }
                if (response.status === 401) logout();
                console.error(`Request to POST:/v1/tasks failed with status ${response.status}`, response);
                return;
            }

            toast.success("Task created successfully");
            navigate(-1);
        } catch (err) {
            console.error(`Request to POST:/v1/tasks failed with error ${err}`);
        }
    };

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
            <div className="mb-6 text-2xl font-bold">Create Task ({tasktype[0].toUpperCase() + tasktype.slice(1)})</div>
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
                        {config.courier?.map((item, index) => {
                            return <option key={index} value={item}>{item}</option>
                        })}
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
                        required
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
                        value={formData.delex_name}
                        onChange={handleInputChange}
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    />
                </div>
                <div className="flex mb-2">
                    <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                        <label htmlFor="delex_contact">Delivery Ph.</label>
                    </div>
                    <input
                        name="delex_contact"
                        id="delex_contact"
                        value={formData.delex_contact}
                        onChange={handleInputChange}
                        pattern="^\d{10}$"
                        title="10-digit mobile number"
                        placeholder="Eg. 9878767658"
                        required
                        className="w-64 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                    />
                </div>
                <button type="submit" className="btn-primary">Create Task</button>
            </form>
        </div>
    );
}

export default ExecutiveTaskForm;
