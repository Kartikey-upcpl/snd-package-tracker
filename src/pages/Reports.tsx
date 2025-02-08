import { useConfig } from "../contexts/ConfigContext";
import { FaDownload } from "react-icons/fa";

const Reports = () => {

    const { config } = useConfig();

    return (
        <div className="p-8">
            <div className="flex justify-between mb-6 text-2xl font-bold">
                Generate Report
            </div>
            <div className="flex gap-4">
                <form target="_blank" action={new URL("/v1/report/packages", import.meta.env.VITE_API_BASE_URL).toString()} className="w-1/2 p-4 border rounded border-neutral-300">
                    <div className="mb-4 text-lg font-bold">Package Report</div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex">
                            <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                                <label htmlFor="timestamp_gte">Date</label>
                            </div>
                            <input
                                name="timestamp_gte"
                                id="timestamp_gte"
                                type="date"
                                defaultValue={new Date().toISOString().split("T")[0]}
                                className="p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                            />
                        </div>
                        <div>to</div>
                        <div className="flex">
                            <input
                                name="timestamp_lte"
                                id="timestamp_lte"
                                type="date"
                                defaultValue={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                                className="p-2 border rounded outline-none border-neutral-300"
                            />
                        </div>
                    </div>
                    <div className="flex mb-2">
                        <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                            <label htmlFor="type">Type</label>
                        </div>
                        <select
                            name="type"
                            id="type"
                            className="w-56 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        >
                            <option value="">All</option>
                            <option value="incoming">Incoming</option>
                            <option value="outgoing">Outgoing</option>
                        </select>
                    </div>
                    <div className="flex mb-2">
                        <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                            <label htmlFor="channel">Channel</label>
                        </div>
                        <select
                            name="channel"
                            id="channel"
                            className="w-56 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        >
                            <option value="">All</option>
                            {config.channel?.map(item => {
                                return <option value={item}>{item}</option>
                            })}
                        </select>
                    </div>
                    <div className="flex mb-4">
                        <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                            <label htmlFor="courier">Courier</label>
                        </div>
                        <select
                            name="courier"
                            id="courier"
                            className="w-56 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        >
                            <option value="">All</option>
                            {config.courier?.map(item => {
                                return <option value={item}>{item}</option>
                            })}
                        </select>
                    </div>
                    <button type="submit" className="flex items-center gap-2 btn-primary"><FaDownload /> Download</button>
                </form>

                <form target="_blank" action={new URL("/v1/report/tasks", import.meta.env.VITE_API_BASE_URL).toString()} className="w-1/2 p-4 border rounded border-neutral-300">
                    <div className="mb-4 text-lg font-bold">Task Report</div>
                    <div className="flex mb-4">
                        <div className="p-2 font-medium border border-r-0 rounded-tl rounded-bl w-28 border-neutral-300 bg-neutral-100">
                            <label htmlFor="task_id">Task ID</label>
                        </div>
                        <input
                            name="task_id"
                            id="task_id"
                            required
                            className="w-56 p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        />
                    </div>
                    <button type="submit" className="flex items-center gap-2 btn-primary"><FaDownload /> Download</button>
                </form>
            </div>
        </div>
    );
}

export default Reports;
