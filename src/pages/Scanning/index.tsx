import { useState, useEffect, useRef, FormEvent, useMemo } from "react";
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
    status: string,
    timestamp: Date,
    remarks?: string,
    cancelled?: boolean,
    synced: boolean
}

const Scanning = () => {

    const { id } = useParams();
    const location = useLocation();
    const { token, logout, user } = useAuth();
    const packageIdInputRef = useRef<HTMLInputElement | null>(null);
    const [scannedPackageListSearch, setScannedPackageListSearch] = useState<string>("");
    const [scannedPackageListMap, setScannedPackageListMap] = useState<Map<string, TScannedPackageListRecord>>(new Map());
    const [expectedPackages, setExpectedPackages] = useState<Map<string, boolean>>(new Map());
    const [falseCount, setFalseCount] = useState(0);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            let count = 0;
            expectedPackages.forEach((value) => {
                if (!value) count++;
            });
            setFalseCount(count);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId); // Cleanup timeout on re-render
    }, [expectedPackages]);

    const [expectedPackagesInput, setExpectedPackagesInput] = useState<string>("");
    const [scanPackageFormData, setScanPackageFormData] = useState<TPostPackageBody>({
        task_id: id as string,
        package_id: "",
        remarks: "",
        cancelled: false
    });
    const tasktype: ("outgoing" | "incoming") = location.pathname.split("/")[1] === "incoming" ? "incoming" : "outgoing";
    const { response, loading, count, refresh } = useFetch<TTaskPopulated | null>(`/v1/tasks/${id}?fields=package_id,cancelled,remarks,created_at`, null);
    // console.log("responsePackage", response?.packages.map((pkg => pkg.status)))
    // const [matchedCount, setMatchedCount] = useState(0);
    // const [notMatchedCount, setNotMatchedCount] = useState(0);
    const [showAlertOnMismatch, setShowAlertOnMismatch] = useState<boolean>(false);

    const matchedCount = useMemo(() => {
        return Array.from(scannedPackageListMap.values()).filter(pkg => pkg.status === "matched").length;
    }, [scannedPackageListMap]);

    const notMatchedCount = useMemo(() => {
        return Array.from(scannedPackageListMap.values()).filter(pkg => pkg.status === "notmatched").length;
    }, [scannedPackageListMap]);

    const updatedPackages = response ? response.packages.map(pkg => ({
        ...pkg,
        status: scannedPackageListMap.get(pkg.package_id)?.status || "notmatched"
    })) : [];



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
                            status: record.status || "notmatched", // Ensure status is always present
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

    useEffect(() => {
        const fetchExpectedPackages = async () => {
            try {
                const response = await fetch(new URL(`/v1/expected-packages/${id}`, import.meta.env.VITE_API_BASE_URL), {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    console.error("Failed to fetch expected packages.");
                    return;
                }

                const data = await response.json();

                // ✅ Convert API response into a Map
                const expectedPackagesMap = new Map<string, boolean>(
                    data.packages.map((pkg: { package_id: string }) => [pkg.package_id, false])
                );

                // ✅ Update Expected Packages State
                setExpectedPackages(new Map(expectedPackagesMap));

                // ✅ Now update the scanned package list to check for matches
                setScannedPackageListMap(prevScannedPackages => {
                    const updatedScannedMap = new Map(prevScannedPackages);

                    updatedScannedMap.forEach((pkg, package_id) => {
                        updatedScannedMap.set(package_id, {
                            ...pkg,
                            status: expectedPackagesMap.has(package_id) ? "matched" : "notmatched"
                        });
                    });

                    return new Map(updatedScannedMap); // Ensure React detects the state change
                });

                // console.log("✅ Expected Packages Fetched & Scanned List Updated");

            } catch (error) {
                console.error("Error fetching expected packages:", error);
            }
        };

        fetchExpectedPackages();
    }, [id, token]); // Runs when `id` or `token` changes




    const handleExpectedPackageSubmit = async (event: FormEvent) => {
        event.preventDefault();

        // ✅ Split by line, trim whitespace, filter out empty lines
        const packageIds = expectedPackagesInput
            .split("\n") // Split by newline
            .map(id => id.trim()) // Trim each line
            .filter(id => id.length >= 6); // ✅ Ensure at least 6 characters

        // console.log("🚀 Package IDs after processing:", packageIds); // ✅ Debug Log

        if (packageIds.length === 0) {
            toast.error("No valid package IDs entered. Each package ID must be at least 6 characters.");
            return;
        }

        try {
            // console.log("📤 Sending request to API...", { task_id: id, package_ids: packageIds, executive: user?.sub }); // ✅ Debug Log

            const response = await fetch(new URL(`/v1/expected-packages`, import.meta.env.VITE_API_BASE_URL), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ task_id: id, package_ids: packageIds.map(id => id.toLowerCase()), executive: user?.sub })
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("❌ API Error:", errorResponse); // ✅ Debug API response
                toast.error(errorResponse.message || "Failed to save expected packages.");
                return;
            }

            const data = await response.json();
            // console.log("✅ API Response:", data); // ✅ Debugging Log

            // ✅ Use the response data to update expected packages
            setExpectedPackages(prev => {
                const updatedMap = new Map(prev);
                data.packages.forEach((pkg: { package_id: string }) => updatedMap.set(pkg.package_id, false)); // ✅ Fix: Explicitly type `pkg`
                return updatedMap;
            });

            // ✅ Call backend to update scanned packages to "matched"
            await fetch(new URL(`/v1/packages/match-expected`, import.meta.env.VITE_API_BASE_URL), {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ task_id: id, package_ids: packageIds })
            });

            // ✅ Refresh the scanned package list after updating status
            refresh();

            setExpectedPackagesInput("");

        } catch (error) {
            console.error("❌ Error submitting expected packages:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        let packageId = scanPackageFormData.package_id.trim();

        if (tasktype === "outgoing") {
            packageId += "_"; // Append "_" to outgoing packages
        }

        if (scannedPackageListMap.has(packageId)) {
            new Audio(beep_error).play();
            toast.error(`Package ${packageId} is already scanned!`);
            setScanPackageFormData({ task_id: id as string, package_id: "", remarks: "", cancelled: false });
            return;
        }

        // Determine if package exists in expected list
        const isMatched = Array.from(expectedPackages).some(([pkg]) => pkg.toLowerCase() === packageId.toLowerCase());
        const status = isMatched ? "matched" : "notmatched";

        if (!isMatched) {
            new Audio(beep_error).play();
            showAlertOnMismatch ? window.alert(`❌ ${packageId} is NOT in the expected list!`) : toast.error(`❌ ${packageId} is NOT in the expected list!`);
            packageIdInputRef.current?.focus();
        } else {
            new Audio(beep_alert).play();
        }

        // Clear input and refocus
        setScanPackageFormData({ task_id: id as string, package_id: "", remarks: "", cancelled: false });
        packageIdInputRef.current?.focus();

        // Prepare data for backend submission
        const postPackageRequestData = {
            task_id: id,
            package_id: packageId.toLocaleLowerCase(),
            remarks: scanPackageFormData.remarks,
            cancelled: scanPackageFormData.cancelled,
            status // Send status from frontend
        };

        // Send package data to backend
        try {
            const response = await fetch(new URL("/v1/packages", import.meta.env.VITE_API_BASE_URL), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(postPackageRequestData)
            });

            if (!response.ok) {
                if (CODE[response.status]) toast.error(CODE[response.status].message);
                if (response.status === 401) logout();
                console.error(`Request to POST /v1/packages failed with status ${response.status}`);
                return;
            }

            const json: { message: string, data: TPackage } = await response.json();
            // console.log("json", json)
            // console.log("response", response)
            // Update scanned package list with server response (Synced ✅)
            setScannedPackageListMap(prev => (
                new Map(prev.set(json.data.package_id, {
                    _id: json.data._id,
                    package_id: json.data.package_id.toLocaleLowerCase(),
                    timestamp: json.data.created_at,
                    remarks: json.data.remarks || "NA",
                    cancelled: response.status === 201 ? json.data.cancelled : true,
                    synced: true,
                    status
                }))
            ));

        } catch (err) {
            console.error(`Request to POST /v1/packages failed with error ${err}`);
        }
    };


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
                    synced: true,
                    status: json.data.status || "notmatched" // ✅ Ensure status is included
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

    // Compare Scanned Packages with Expected
    useEffect(() => {
        setExpectedPackages(prev => {
            const updated = new Map(prev);

            scannedPackageListMap.forEach((_, package_id) => {
                // Case-insensitive check for scanned packages
                for (let key of updated.keys()) {
                    if (key.toLowerCase() === package_id.toLowerCase()) {
                        updated.set(key, true);
                    }
                }
            });

            // ✅ New Logic: Case-insensitive match for newly added expected packages
            prev.forEach((_, package_id) => {
                for (let key of scannedPackageListMap.keys()) {
                    if (package_id.toLowerCase() === key.toLowerCase()) {
                        updated.set(package_id, true);
                    }
                }
            });

            return updated;
        });
    }, [scannedPackageListMap]);

    return (
        loading && count === 0 ? <PageLoading /> :
            <div>
                <div>
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
                                notMatchedCount={notMatchedCount}
                                matchedCount={matchedCount}
                                falseCount={falseCount}
                                expected_scanned={expectedPackages.size}
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
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Show Alert on Mismatch:</label>
                                    <input
                                        type="checkbox"
                                        checked={showAlertOnMismatch}
                                        onChange={() => setShowAlertOnMismatch(prev => !prev)}
                                        className="w-4 h-4"
                                    />
                                </div>
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
                        packages={updatedPackages}
                    />}
                </div>
                {user?.role === "admin" &&
                    <div className="flex justify-between p-8 pb-8 gap-x-16">
                        <div className="w-4/12">
                            <div className="text-xl font-bold mb-2">
                                <label htmlFor="packages">Save Expected Package IDs</label>
                            </div>
                            <form onSubmit={handleExpectedPackageSubmit} className="p-2 border rounded border-neutral-300">
                                <textarea
                                    name="expectedPackages"
                                    id="expectedPackages"
                                    value={expectedPackagesInput}
                                    onChange={(e) => setExpectedPackagesInput(e.target.value)}
                                    placeholder="Enter expected package IDs (one per line)"
                                    required
                                    className="w-full p-2 border rounded border-neutral-300"
                                />
                                <button type="submit" className="mt-2 text-sm btn-primary">Submit Expected Packages</button>
                            </form>

                        </div>
                        <div className="w-8/12">
                            <h2 className="text-xl font-bold mb-2">Expected Packages</h2>
                            <div className="h-64 overflow-y-scroll border border-neutral-300 rounded p-2">
                                {expectedPackages.size === 0 ? (
                                    <p className="text-gray-500">No expected packages.</p>
                                ) : (
                                    Array.from(expectedPackages.entries()).map(([packageId, scanned]) => (
                                        <div key={packageId} className={`p-2 rounded mb-1 ${scanned ? "bg-green-200" : "bg-red-200"}`}>
                                            {packageId} {scanned ? "(Scanned ✅)" : "(Not Scanned ❌)"}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                }
            </div>
    )
}

export default Scanning;
