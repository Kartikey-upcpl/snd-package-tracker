import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPrint } from "react-icons/fa6";
import { FaRegTrashAlt, FaDownload } from "react-icons/fa";
import PageLoading from "../../components/PageLoading";
import TaskPdfReport from "../../components/TaskPdfReport";
import { useAuth } from "../../contexts/AuthContext";
import useFetch from "../../hooks/useFetch";
import { CODE } from "../../utils/response";
import { DDMMYYHHMMSS, DDMMYYYY } from "../../utils/date";

const TaskDetails = () => {
    const { id } = useParams();
    const { token, logout } = useAuth();
    const { response, loading, count, refresh } = useFetch<TTaskPopulated | null>(`/v1/tasks/${id}`, null);
    const [search, setSearch] = useState("");

    const handleDelete = async (id: string, package_id: string) => {
        try {
            if (confirm(`Confirm delete package (ID: ${package_id}) ?`)) {
                const response = await fetch(new URL(`/v1/packages/${id}`, import.meta.env.VITE_API_BASE_URL), {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    if (CODE[response.status]) toast.error(CODE[response.status].message);
                    if (response.status === 401) logout();
                    console.error(`Request to DELETE:/v1/packages${id} failed with status ${response.status}`, response);
                    return;
                }
                setSearch("");
                toast.success(`Package deleted (ID: ${package_id})`);
                refresh();
            }
        } catch (err) {
            console.error(`Request to DELETE:/v1/packages/${id} failed with error ${err}`);
        }
    }

    return (
        loading && count === 0 ? <PageLoading /> : response && <div className="p-8">
            <div className="flex justify-between mb-6">
                <div className="text-2xl font-bold">Task Report</div>
                <div className="flex">
                    <button onClick={() => {
                        document.title = `Report_${response.task_id} (${DDMMYYYY(response.created_at)})`;
                        window.print();
                        document.title = "StarAndDaisy - Package Tracker"
                    }}
                        className="flex items-center gap-2 mr-2 btn-primary"
                    ><FaPrint /> Print</button>
                    <form target="_blank" action={new URL("/v1/report/tasks", import.meta.env.VITE_API_BASE_URL).toString()} className="mr-2">
                        <input type="hidden" name="task_id" value={response.task_id} />
                        <button type="submit" className="flex items-center gap-2 btn-primary"><FaDownload /> Report</button>
                    </form>
                    <input
                        type="search"
                        name="package_id"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value) }}
                        className="p-2 border rounded outline-none border-neutral-300"
                    />
                </div>
            </div>

            <div className="flex justify-between p-4 mb-4 border rounded border-neutral-300">
                <div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="px-2 py-1 font-bold w-28 bg-neutral-100">Task ID:</div>
                        <div className="w-40 px-2 py-1">{response.task_id}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="px-2 py-1 font-bold w-28 bg-neutral-100">Channel:</div>
                        <div className="w-40 px-2 py-1">{response.channel}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="px-2 py-1 font-bold w-28 bg-neutral-100">Courier:</div>
                        <div className="w-40 px-2 py-1">{response.courier}</div>
                    </div>
                </div>
                <div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="px-2 py-1 font-bold w-28 bg-neutral-100">Delivery Ex.:</div>
                        <div className="w-40 px-2 py-1">{response.delex_name}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="px-2 py-1 font-bold w-28 bg-neutral-100">Delivery Ph.:</div>
                        <div className="w-40 px-2 py-1">{response.delex_contact}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="px-2 py-1 font-bold w-28 bg-neutral-100">Vehicle No.:</div>
                        <div className="w-40 px-2 py-1">{response.vehicle_no}</div>
                    </div>
                </div>
                <div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-20 px-2 py-1 font-bold bg-neutral-100">Scanned</div>
                        <div className="w-12 px-2 py-1">{response.packages.length}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-20 px-2 py-1 font-bold bg-neutral-100">Cancel</div>
                        <div className="w-12 px-2 py-1">{response.type === "outgoing" ? response.packages.filter(item => item.cancelled).length : "-"}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-20 px-2 py-1 font-bold bg-neutral-100">Dispatch</div>
                        <div className="w-12 px-2 py-1">{response.packages.length - response.packages.filter(item => item.cancelled).length}</div>
                    </div>
                </div>
                <div className="grid text-2xl font-bold bg-yellow-300 rounded place-content-center size-20">
                    {response?.type === "outgoing" ? "OUT" : "IN"}
                </div>
            </div>

            <table className="w-full text-center">
                <thead className="border rounded-md bg-neutral-100 border-neutral-300">
                    <tr>
                        <th className="py-3">S.No.</th>
                        <th className="py-3">Package ID</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Scanned At</th>
                        <th className="py-3">Executive</th>
                        <th className="py-3">Remarks</th>
                        <th className="py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-1"></td>
                    </tr>
                </tbody>
                <tbody>
                    {response.packages
                        .filter(pkg => pkg.package_id.includes(search))
                        .map((pkg, i) => {
                            return <tr key={pkg._id} className={`border ${pkg.cancelled ? "bg-red-100" : "*:"}`}>
                                <td className="py-2">{i + 1}</td>
                                <td className="py-2">{pkg.package_id}</td>
                                <td className="py-2">{pkg.cancelled ? "Cancel" : pkg.type === "incoming" ? "Return" : "Dispatch"}</td>
                                <td className="py-2">{DDMMYYHHMMSS(pkg.created_at)}</td>
                                <td className="py-2">{pkg.executive?.name} ({pkg.executive?.username})</td>
                                <td className="py-2">{pkg.remarks}</td>
                                <td className="py-2">
                                    <button className="p-2 text-white bg-red-600 rounded-full" onClick={() => { handleDelete(pkg._id, pkg.package_id) }}>
                                        <FaRegTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        })}
                </tbody>
            </table>
            {response && <TaskPdfReport
                task_id={response.task_id}
                type={response.type}
                created_at={response.created_at}
                channel={response.channel}
                courier={response.courier}
                delex_name={response.delex_name}
                delex_contact={response.delex_contact}
                vehicle_no={response.vehicle_no}
                packages={response.packages}
            />}
        </div>
    );
}

export default TaskDetails;
