import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { DDMMYYHHMMSS } from "../../utils/date";
import { CODE } from "../../utils/response";

const Packages = () => {
    const { token, logout } = useAuth();
    const [searchPackageId, setSearchPrackageId] = useState<string>("");
    const [packageDetails, setPackageDetails] = useState<TPackagePopulated | null>(null);

    const handleSearchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch(new URL(`/v1/packages/${searchPackageId}`, import.meta.env.VITE_API_BASE_URL), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message);
                if (response.status === 401) logout();
                console.error(`Request to GET:/v1/packages/${searchPackageId} failed with status ${response.status}`, response);
                return;
            }
            const json: TPackagePopulated = await response.json();
            setPackageDetails(json);
        } catch (err) {
            console.error(`Request to GET:/v1/packages/${searchPackageId} failed with error ${err}`);
        }
    }

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
                setPackageDetails(null);
                setSearchPrackageId("");
                toast.success(`Package deleted (ID: ${package_id})`);
            }
        } catch (err) {
            console.error(`Request to DELETE:/v1/packages/${id} failed with error ${err}`);
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between mb-6 text-2xl font-bold">
                Search Package
            </div>
            <form onSubmit={handleSearchSubmit} className="mb-8">
                <input
                    type="search"
                    value={searchPackageId}
                    onChange={(e) => setSearchPrackageId(e.target.value)}
                    placeholder="Package ID"
                    className="p-2 mr-2 border rounded outline-none border-neutral-300"
                />
                <button type="submit" className="btn-primary">Search</button>
            </form>
            {packageDetails && <div className="flex gap-4 p-4 border rounded border-neutral-300">
                <div className="w-1/2">
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Package ID </div>
                        <div className="p-2">{packageDetails.package_id}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Status </div>
                        <div className="p-2">{packageDetails.cancelled ? "Cancel" : packageDetails.type === "incoming" ? "Return" : "Dispatch"}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Channel </div>
                        <div className="p-2">{packageDetails.channel}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Courier </div>
                        <div className="p-2">{packageDetails.courier}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Executive </div>
                        <div className="p-2">{packageDetails.executive?.name} ({packageDetails.executive?.username})</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Scanned At </div>
                        <div className="p-2">{DDMMYYHHMMSS(packageDetails.created_at)}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Remarks </div>
                        <div className="p-2">{packageDetails.remarks || "NA"}</div>
                    </div>
                </div>
                <div className="w-1/2">
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Task ID </div>
                        <div className="p-2">{packageDetails.task?.task_id}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Task Status </div>
                        <div className="p-2">{packageDetails.task?.is_open ? "Open" : "Closed"}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Vehicle No. </div>
                        <div className="p-2">{packageDetails.task?.vehicle_no}</div>
                    </div>
                    <div className="flex mb-2 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Delivery Ex. </div>
                        <div className="p-2">{packageDetails.task?.delex_name}</div>
                    </div>
                    <div className="flex mb-8 border rounded border-neutral-300">
                        <div className="w-32 p-2 font-bold bg-neutral-100">Delivery Ph. </div>
                        <div className="p-2">{packageDetails.task?.delex_contact}</div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => { handleDelete(packageDetails._id, packageDetails.package_id) }} className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700">Delete</button>
                    </div>
                </div>
            </div>}
        </div>
    );
}

export default Packages;
