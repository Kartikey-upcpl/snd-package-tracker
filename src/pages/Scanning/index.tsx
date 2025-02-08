import { useState, useEffect, useRef, FormEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ScannedList from "./ScannedList";
import TaskDetailCard from "./TaskDetailCard";
import PageLoading from "../../components/PageLoading";
import TaskPdfReport from "../../components/TaskPdfReport";
import { CODE } from "../../utils/response";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../contexts/AuthContext";
import beep_alert from "../../assets/audio/beep-alert.mp3";
import beep_error from "../../assets/audio/beep-error.mp3";
import { DDMMYYYY } from "../../utils/date";

type TPostPackageBody = {
    task_id: string,
    package_id: string,
    remarks?: string,
    cancelled?: boolean
}

type TScannedPackageListRecord = {
    _id?: string,
    package_id: string,
    timestamp: Date,
    remarks?: string,
    cancelled?: boolean,
    synced: boolean
}

const Scanning = () => {

    const { id } = useParams();
    const location = useLocation();
    const { token, logout } = useAuth();
    const packageIdInputRef = useRef<HTMLInputElement | null>(null);
    const [scannedPackageListSearch, setScannedPackageListSearch] = useState<string>("");
    const [scannedPackageListMap, setScannedPackageListMap] = useState<Map<string, TScannedPackageListRecord>>(new Map());

    const [scanPackageFormData, setScanPackageFormData] = useState<TPostPackageBody>({
        task_id: id as string,
        package_id: "",
        remarks: "",
        cancelled: false
    });
    const tasktype: ("outgoing" | "incoming") = location.pathname.split("/")[1] === "incoming" ? "incoming" : "outgoing";

    const { response, loading, count, refresh } = useFetch<TTaskPopulated | null>(`/v1/tasks/${id}?fields=package_id,cancelled,remarks,created_at`, null);

    // populate scanned packages list with pre-scanned packages
    useEffect(() => {
        if (response) {
            setScannedPackageListMap(new Map(
                response.packages.map(record => {
                    return [
                        record.package_id,
                        {
                            _id: record._id,
                            package_id: record.package_id,
                            timestamp: record.created_at,
                            remarks: record.remarks || "NA",
                            cancelled: record.cancelled,
                            synced: true
                        }
                    ]
                })
            ));
        }
    }, [response]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if(tasktype === "outgoing") {
            scanPackageFormData.package_id += "_"
        }
        // check if package_id already exists in scanned list
        if (scannedPackageListMap.get(scanPackageFormData.package_id) || scannedPackageListMap.get(scanPackageFormData.package_id.toUpperCase()) || scannedPackageListMap.get(scanPackageFormData.package_id.toLowerCase())) {
            new Audio(beep_error).play();
            setScanPackageFormData({
                task_id: id as string,
                package_id: "",
                remarks: "",
                cancelled: false
            });
            return;
        }

        // add to scanned list with pending sync
        setScannedPackageListMap(prev => {
            prev.set(
                scanPackageFormData.package_id,
                {
                    package_id: scanPackageFormData.package_id,
                    timestamp: new Date(),
                    remarks: scanPackageFormData.remarks,
                    cancelled: scanPackageFormData.cancelled,
                    synced: false
                }
            );
            return prev;
        });

        // clear scan package form data
        const postPacakgeRequestData = scanPackageFormData;
        setScanPackageFormData({
            task_id: id as string,
            package_id: "",
            remarks: "",
            cancelled: false
        });

        // ok beep
        new Audio(beep_alert).play();

        // re-focus on package id input 
        packageIdInputRef.current?.focus();

        // POST package
        try {
            const response = await fetch(new URL("/v1/packages", import.meta.env.VITE_API_BASE_URL), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(postPacakgeRequestData)
            });
            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message);
                if (response.status === 401) logout();
                console.error(`Request to POST:/v1/packages failed with status ${response.status}`);
                return;
            }
            const json: { message: string, data: TPackage } = await response.json();

            // update package with server response
            setScannedPackageListMap(prev => (
                new Map(prev.set(json.data.package_id, {
                    _id: json.data._id,
                    package_id: json.data.package_id,
                    timestamp: json.data.created_at,
                    remarks: json.data.remarks || "NA",
                    cancelled: response.status === 201 ? json.data.cancelled : true,
                    synced: true
                }))
            ));


        } catch (err) {
            console.error(`Request to POST:/v1/packages failed with error ${err}`);
        }
    }

    const handleDelete = async (id: string, package_id: string) => {
        try {
            toast.loading(`Processing delete (ID: ${package_id})`, { id });
            const response = await fetch(new URL(`/v1/packages/${id}`, import.meta.env.VITE_API_BASE_URL), {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message, { id });
                if (response.status === 401) logout();
                console.error(`Request to DELETE:/v1/packages${id} failed with status ${response.status}`, response);
                return;
            }
            toast.success(`Package deleted (ID: ${package_id})`, { id });
            refresh();
        } catch (err) {
            console.error(`Request to DELETE:/v1/packages/${id} failed with error ${err}`);
        }
    }

    const handleCancel = async (id: string, package_id: string, isCancelled: boolean) => {
        try {
            setScannedPackageListMap(prev => {
                const cancelledPackage = prev.get(package_id);
                if (cancelledPackage) {
                    prev.set(package_id, {
                        ...cancelledPackage,
                        synced: false
                    })
                }
                return new Map(prev);
            });
            const response = await fetch(new URL(`/v1/packages/${id}`, import.meta.env.VITE_API_BASE_URL), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ cancelled: isCancelled })
            });
            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message, { id });
                if (response.status === 401) logout();
                console.error(`Request to PATCH:/v1/packages${id} failed with status ${response.status}`, response);
                return;
            }
            const json: { message: string, data: TPackage } = await response.json();

            // update package with server response
            setScannedPackageListMap(prev => (
                new Map(prev.set(json.data.package_id, {
                    _id: json.data._id,
                    package_id: json.data.package_id,
                    timestamp: json.data.created_at,
                    remarks: json.data.remarks || "NA",
                    cancelled: json.data.cancelled,
                    synced: true
                }))
            ));
        } catch (err) {
            console.error(`Request to PATCH:/v1/packages/${id} failed with error ${err}`);
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.target.name === "package_id") {
            if (event.target.value.length >= 6) event.target.classList.remove("outline-red-500")
            else event.target.classList.add("outline-red-500")
        }
        setScanPackageFormData(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        });
    }

    const printReport = async () => {
        refresh();
        toast.loading("Syncing data", { id: "print_toast" });
        if (scannedPackageListMap.size !== response?.packages.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Retry printing", { id: "print_toast" });
            return;
        }
        toast.success("Printing", { id: "print_toast" });
        document.title = `Report_${response.task_id} (${DDMMYYYY(response.created_at)})`;
        window.print();
        document.title = "StarAndDaisy - Package Tracker"
    }

    return (
        loading && count === 0 ? <PageLoading /> : <div>
            <div className="flex p-8 gap-x-16">
                <div className="w-4/12">
                    {response && <TaskDetailCard
                        task_id={response.task_id}
                        courier={response.courier}
                        channel={response.channel}
                        type={response.type}
                        delex_name={response.delex_name}
                        delex_contact={response.delex_contact}
                        vehicle_no={response.vehicle_no}
                        created_by={response.created_by}
                        created_at={response.created_at}
                        scanned={scannedPackageListMap.size}
                        cancelled={[...scannedPackageListMap.values()].filter(obj => obj.cancelled).length}
                        printReport={printReport}
                    />}

                    <div className="mb-2 text-xl font-bold">Scan Here</div>
                    <form className="p-2 border rounded border-neutral-300" onSubmit={handleSubmit}>
                        <div className="flex gap-2 mb-2">
                            <input
                                ref={packageIdInputRef}
                                type="text"
                                name="package_id"
                                placeholder="Package ID"
                                value={scanPackageFormData.package_id}
                                onChange={handleInputChange}
                                required
                                pattern="^\w{6,}$"
                                title="Minimum 6 digits required"
                                className="w-full p-2 text-sm border rounded border-neutral-300 outline-red-500"
                            />
                            <button type="submit" className="text-sm btn-primary">Submit</button>
                        </div>
                        <div>
                            <input
                                placeholder="Remarks"
                                name="remarks"
                                value={scanPackageFormData.remarks}
                                onChange={handleInputChange}
                                className="w-full p-2 text-sm border rounded border-neutral-300"
                            />
                        </div>
                        <div className={`flex items-center ${tasktype === "outgoing" ? "justify-between" : "justify-end"}`}>
                            {(tasktype === "outgoing") && <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="cancelled"
                                    name="cancelled"
                                    value="cancel"
                                    onChange={() => {
                                        setScanPackageFormData(prev => ({
                                            ...prev,
                                            cancelled: !prev.cancelled
                                        }));
                                    }}
                                    checked={scanPackageFormData.cancelled}
                                    className="w-4 h-4 accent-red-500"
                                />
                                <label htmlFor="cancelled" className="px-1 text-sm font-medium text-red-600 rounded cursor-pointer select-none">Cancelled</label>

                            </div>}
                        </div>
                    </form>
                </div>
                <div className="w-8/12">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xl font-bold">Scanned List</div>
                        <input
                            type="search"
                            placeholder="Search"
                            value={scannedPackageListSearch}
                            onChange={(event) => {
                                setScannedPackageListSearch(event.target.value);
                            }}
                            className="p-2 text-sm border rounded outline-none border-neutral-300"
                        />
                    </div>
                    <div className="h-[calc(100vh-12rem)] overflow-y-scroll border-b border-t border-neutral-300">
                        {response && <ScannedList
                            list={Array.from(scannedPackageListMap.values())
                                .filter(scannedPackageListItem => scannedPackageListItem.package_id.includes(scannedPackageListSearch))
                                .reverse()}
                            type={response.type}
                            handleDelete={handleDelete}
                            handleCancel={handleCancel}
                        />}
                    </div>
                </div>
            </div>
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
    )
}

export default Scanning;
