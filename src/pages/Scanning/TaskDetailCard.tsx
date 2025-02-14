import { FaPrint } from "react-icons/fa6";
import { DDMMYYHHMMSS } from "../../utils/date";

type TTaskDetailsProps = {
    task_id: string,
    courier: string,
    channel: string,
    type: string,
    delex_name: string,
    delex_contact: string,
    vehicle_no: string,
    created_by: {
        name: string,
        username: string
    },
    created_at: Date,
    scanned: number,
    cancelled: number,
    expected_scanned: number,
    notMatchedCount: number,
    falseCount: number,
    matchedCount: number
    printReport: () => Promise<void>
};

const TaskDetails = (props: TTaskDetailsProps) => {
    return (
        <div className="mb-6 bg-white border rounded border-neutral-300">
            <div className="flex items-center justify-between p-2 mb-2 bg-neutral-100">
                <div className="text-xl font-bold">{props.courier} - {props.channel}</div>
                <button onClick={props.printReport} className="flex items-center gap-2 text-sm btn-primary"><FaPrint /> Print</button>
            </div>
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-sm">
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Task ID:</div>
                        <div className="w-40 px-2 py-1">{props.task_id}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Type:</div>
                        <div className="w-40 px-2 py-1">{props.type}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Delivery Ex.:</div>
                        <div className="w-40 px-2 py-1">{props.delex_name}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Delivery Ph.:</div>
                        <div className="w-40 px-2 py-1">{props.delex_contact}</div>
                    </div>
                    <div className="flex mb-1 border rounded-sm border-neutral-300">
                        <div className="w-24 px-2 py-1 font-bold bg-neutral-100">Vehicle No.:</div>
                        <div className="w-40 px-2 py-1">{props.vehicle_no}</div>
                    </div>
                </div>
                <div className="px-6 py-3 text-2xl font-bold bg-yellow-300 rounded">
                    {props.type === "outgoing" ? "OUT" : "IN"}
                </div>
            </div>
            <div className="grid w-full grid-cols-3">
                <div className="p-2 text-center bg-blue-200 border border-x-0 border-neutral-300">
                    <div className="font-medium">Scanned</div>
                    <div className="text-3xl font-bold">{props.scanned}</div>
                </div>
                <div className="p-2 text-center bg-red-200 border border-neutral-300">
                    <div className="font-medium">Cancelled</div>
                    <div className="text-3xl font-bold">{props.type === "outgoing" ? props.cancelled : "-"}</div>
                </div>
                <div className="p-2 text-center bg-green-200 border border-x-0 border-neutral-300">
                    <div className="font-medium">{props.type === "outgoing" ? "Dispatch" : "Return"}</div>
                    <div className="text-3xl font-bold">{props.type === "outgoing" ? props.scanned - props.cancelled : props.scanned}</div>
                </div>
                <div className="p-2 text-center bg-blue-200 border border-x-0 border-neutral-300">
                    <div className="font-medium">Predefined Count</div>
                    <div className="text-3xl font-bold">{props.expected_scanned}</div>
                </div>
                <div className="p-2 text-center bg-red-200 border border-neutral-300">
                    <div className="font-medium">Scanned/Not Match</div>
                    <div className="text-3xl font-bold">{props.notMatchedCount}</div>
                </div>
                <div className="p-2 text-center bg-green-200 border border-x-0 border-neutral-300">
                    <div className="font-medium">Total Match</div>
                    <div className="text-3xl font-bold">{props.matchedCount}</div>
                </div>
                <div className="p-2 text-center bg-red-200 border border-neutral-300">
                    <div className="font-medium">Expected/Not Match</div>
                    <div className="text-3xl font-bold">{props.falseCount}</div>
                </div>
            </div>
            <div className="px-4 py-2 text-xs font-medium bg-neutral-100">
                <div><span className="font-bold">Created By:</span> {props.created_by?.name} ({props.created_by?.username})</div>
                <div><span className="font-bold">Created At:</span> {DDMMYYHHMMSS(props.created_at)}</div>
            </div>
        </div>
    );
}

export default TaskDetails;
