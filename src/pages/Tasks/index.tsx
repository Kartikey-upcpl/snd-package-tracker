import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineEdit, MdRemoveRedEye } from "react-icons/md";
import PageLoading from "../../components/PageLoading";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";
import useFetch from "../../hooks/useFetch";
import { DDMMYYHHMMSS } from "../../utils/date";
import { CODE } from "../../utils/response";

const Tasks = () => {

    const { config } = useConfig();
    const { token, logout } = useAuth();
    const { response, loading, count, refresh } = useFetch<{ metadata: {}, data: TTask[] } | null>("/v1/tasks?page=1&limit=100", null);

    const [taskFilter, setTaskFilter] = useState({
        task_id: "",
        type: "",
        status: "",
        courier: ""
    });

    const handleDelete = async (id: string, task_id: string) => {
        if (confirm(`Confirm delete task (ID: ${task_id})?`)) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}v1/tasks/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    if (CODE[response.status]) toast.error(CODE[response.status].message);
                    if (response.status === 401) logout();
                    console.error(`Request to DELETE:/v1/tasks failed with status ${response.status}`, response);
                    return;
                }
                toast.success(`Task deleted (ID: ${task_id})`);
                refresh();
            } catch (err) {
                console.error(`Request to DELETE:/v1/tasks failed with error ${err}`);
            }
        }
    }

    const handleStatusUpdate = async (id: string, task_id: string, is_open: boolean) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}v1/tasks/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_open: !is_open })
            });
            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message);
                if (response.status === 401) logout();
                console.error(`Request to PATCH:/v1/tasks failed with status ${response.status}`, response);
                return;
            }
            const json = await response.json();
            toast.success(`Task ${json.data.is_open ? "opened" : "closed"} (ID: ${task_id})`);
            refresh();
        } catch (err) {
            console.error(`Request to PATCH:/v1/tasks failed with error ${err}`);
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setTaskFilter(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        });
    }

    return (
        loading && count === 0 ? <PageLoading /> : <div className="p-8">
            <div className="flex justify-between mb-6">
                <div className="text-2xl font-bold">Manage Tasks</div>
                <div className="flex">
                    <div className="flex mr-2">
                        <div className="p-2 font-medium text-center border border-r-0 rounded-tl rounded-bl min-w-16 border-neutral-300 bg-neutral-100">
                            <label htmlFor="type">Type</label>
                        </div>
                        <select name="type" id="type" value={taskFilter.type} onChange={handleInputChange} className="p-2 border rounded-tr rounded-br outline-none border-neutral-300">
                            <option value="">All</option>
                            <option value="outgoing">Outgoing</option>
                            <option value="incoming">Incoming</option>
                        </select>
                    </div>
                    <div className="flex mr-2">
                        <div className="p-2 font-medium text-center border border-r-0 rounded-tl rounded-bl min-w-16 border-neutral-300 bg-neutral-100">
                            <label htmlFor="status">Status</label>
                        </div>
                        <select name="status" id="status" value={taskFilter.status} onChange={handleInputChange} className="p-2 border rounded-tr rounded-br outline-none border-neutral-300">
                            <option value="">All</option>
                            <option value="true">Open</option>
                            <option value="false">Closed</option>
                        </select>
                    </div>
                    <div className="flex mr-2">
                        <div className="p-2 font-medium text-center border border-r-0 rounded-tl rounded-bl min-w-16 border-neutral-300 bg-neutral-100">
                            <label htmlFor="courier">Courier</label>
                        </div>
                        <select name="courier" id="courier" value={taskFilter.courier} onChange={handleInputChange} className="p-2 border rounded-tr rounded-br outline-none border-neutral-300">
                            <option value="">All</option>
                            {config.courier?.map(item => {
                                return <option value={item}>{item}</option>
                            })}
                        </select>
                    </div>
                    <input
                        type="search"
                        name="task_id"
                        placeholder="Search"
                        value={taskFilter.task_id}
                        onChange={handleInputChange}
                        className="p-2 mr-8 border rounded outline-none border-neutral-300"
                    />
                    <Link to="create">
                        <button className="btn-primary">Create Task</button>
                    </Link>
                </div>
            </div>
            <table className="w-full text-center">
                <thead className="border rounded-md bg-neutral-100 border-neutral-300">
                    <tr>
                        <th className="py-3">S.No.</th>
                        <th className="py-3">Task ID</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Courier</th>
                        <th className="py-3">Channel</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Vehicle</th>
                        <th className="py-3">Delivery Ex.</th>
                        <th className="py-3">Delivery Ph.</th>
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
                    {response?.data && response.data
                        .filter(task => (task.task_id.includes(taskFilter.task_id)) &&
                            (!taskFilter.type || task.type === taskFilter.type) &&
                            (!taskFilter.status || task.is_open.toString() === taskFilter.status) &&
                            (!taskFilter.courier || task.courier === taskFilter.courier)
                        )
                        .map((task, i) => {
                            return (
                                <tr key={task._id} className="border">
                                    <td className="py-2">{i + 1}</td>
                                    <td className="py-2 font-mono">{task.task_id}</td>
                                    <td className="py-2"><TaskType type={task.type} /></td>
                                    <td className="py-2">{task.courier}</td>
                                    <td className="py-2">{task.channel}</td>
                                    <td className="py-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={task.is_open} onChange={() => { handleStatusUpdate(task._id, task.task_id, task.is_open) }} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
                                        </label>
                                    </td>
                                    <td className="py-2">{task.vehicle_no}</td>
                                    <td className="py-2">{task.delex_name}</td>
                                    <td className="py-2">{task.delex_contact}</td>
                                    <td className="py-2">{DDMMYYHHMMSS(task.created_at)}</td>
                                    <td className="py-2">
                                        <Link to={`view/${task._id}`} state={task}>
                                            <button className="p-2 mr-1 text-white bg-blue-700 rounded-full"><MdRemoveRedEye /></button>
                                        </Link>
                                        <Link to={`update/${task._id}`} state={task}>
                                            <button className="p-2 mr-1 text-white bg-green-700 rounded-full"><MdOutlineEdit /></button>
                                        </Link>
                                        <button className="p-2 text-white bg-red-600 rounded-full" onClick={() => { handleDelete(task._id, task.task_id) }}>
                                            <FaRegTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}

const TaskType = ({ type }: { type: "incoming" | "outgoing" }) => {
    return (
        <div className={`rounded py-1 text-sm font-medium ${type === "outgoing" ? "bg-green-300" : "bg-yellow-200"}`}>
            {type[0].toUpperCase() + type.slice(1)}
        </div>
    );
};

export default Tasks;
