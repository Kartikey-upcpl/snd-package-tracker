import { DDMMYYHHMMSS } from "../utils/date";
import logo from "../assets/logo.webp";

type TTaskPdfReportProps = {
    task_id: string,
    type: "incoming" | "outgoing",
    channel: string,
    courier: string,
    delex_name: string,
    delex_contact: string,
    vehicle_no: string,
    created_at: Date,
    packages: TPackagePopulated[]
}

const TaskPdfReport = (props: TTaskPdfReportProps) => {
    return (
        <div className="visible hidden w-full text-xs print:block print:absolute print:top-0 print:left-0">
            <div className="flex items-center justify-between h-10 my-4">
                <img src={logo} alt="staranddaisy" className="h-full" />
                <div>
                    <div className="font-bold">Task Report ({props.task_id})</div>
                    <div className="text-sm font-bold text-right">{DDMMYYHHMMSS(props.created_at)}</div>
                </div>
            </div>
            <div className="flex items-center justify-between p-2 mb-4 border rounded border-neutral-300">
                <div className="space-y-1">
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-20 px-2 py-1 font-bold bg-neutral-100">Task ID:</div>
                        <div className="px-2 py-1 w-28">{props.task_id}</div>
                    </div>
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-20 px-2 py-1 font-bold bg-neutral-100">Channel:</div>
                        <div className="px-2 py-1 w-28">{props.channel}</div>
                    </div>
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-20 px-2 py-1 font-bold bg-neutral-100">Courier:</div>
                        <div className="px-2 py-1 w-28">{props.courier}</div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Delivery Ex.:</div>
                        <div className="w-32 px-2 py-1">{props.delex_name}</div>
                    </div>
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Delivery Ph.:</div>
                        <div className="w-32 px-2 py-1">{props.delex_contact}</div>
                    </div>
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Vehicle No.:</div>
                        <div className="w-32 px-2 py-1">{props.vehicle_no}</div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-16 px-2 py-1 font-bold bg-neutral-100">Total</div>
                        <div className="w-12 px-2 py-1">{props.packages.length}</div>
                    </div>
                    {props.type === "outgoing" && <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-16 px-2 py-1 font-bold bg-neutral-100">Cancel</div>
                        <div className="w-12 px-2 py-1">{props.type === "outgoing" ? props.packages.filter(item => item.cancelled).length : "-"}</div>
                    </div>}
                    {props.type === "outgoing" && <div className="flex border rounded-sm border-neutral-300">
                        <div className="w-16 px-2 py-1 font-bold bg-neutral-100">Dispatch</div>
                        <div className="w-12 px-2 py-1">{props.packages.length - props.packages.filter(item => item.cancelled).length}</div>
                    </div>}
                </div>
                <div className="grid text-2xl font-bold bg-yellow-300 rounded place-content-center size-20">
                    {props.type === "outgoing" ? "OUT" : "IN"}
                </div>
            </div>

            <table className="w-full text-center">
                <thead className="border bg-neutral-100">
                    <tr>
                        <th className="py-1">S.No.</th>
                        <th className="py-1">Package ID</th>
                        <th className="py-1">Status</th>
                        <th className="py-1">Scanned At</th>
                        <th className="py-1">Executive</th>
                        <th className="py-1">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {props.packages.map((item, i) => {
                        return <tr key={item._id} className={`border ${item.cancelled ? "bg-red-100" : "*:"}`}>
                            <td className="py-[2px]">{i + 1}</td>
                            <td className="py-[2px]">{item.package_id}</td>
                            <td className="py-[2px]">{item.status}</td>
                            <td className="py-[2px]">{DDMMYYHHMMSS(item.created_at)}</td>
                            <td className="py-[2px]">{item?.executive?.name}</td>
                            <td className="py-[2px]"><span>{item.cancelled && "CAN"}</span>{item.remarks}</td>
                        </tr>
                    })}
                </tbody>
            </table>
            <div className="flex items-center justify-end mt-14 gap-x-8">
                <div className="flex border rounded-sm border-neutral-300">
                    <div className="w-16 px-2 py-1 font-bold bg-neutral-100">Total</div>
                    <div className="w-12 px-2 py-1">{props.packages.length}</div>
                </div>
                <div className="font-bold">Signature __________________________</div>
            </div>
        </div>
    );
}

export default TaskPdfReport;
