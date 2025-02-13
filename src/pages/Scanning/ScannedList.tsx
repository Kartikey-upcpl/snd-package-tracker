import { FaRegTrashAlt } from "react-icons/fa";
import { IoArrowUndoCircleOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters, AiOutlinePlus } from "react-icons/ai";
import { MdCheck, MdOutlineCloudUpload, MdOutlineCancel } from "react-icons/md";
import { DDMMYYHHMMSS } from "../../utils/date";

type TScannedListProps = {
    list: {
        _id?: string,
        package_id: string,
        status: string,
        timestamp: Date,
        remarks?: string,
        cancelled?: boolean,
        synced: boolean
    }[],
    type: "outgoing" | "incoming",
    handleDelete: (id: string, package_id: string) => void,
    handleCancel: (id: string, package_id: string, isCancelled: boolean) => void
}

const ScannedList = ({ list, type, handleDelete, handleCancel }: TScannedListProps) => {
    return (
        <table className="w-full text-center">
            <thead className="border border-t-0 bg-neutral-100 border-neutral-300">
                <tr>
                    <th className="py-3">S.No.</th>
                    <th className="py-3">Package ID</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Scanned At</th>
                    <th className="py-3">Remarks</th>
                    <th className="py-3"><MdOutlineCloudUpload /></th>
                    <th className="py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="py-1"></td>
                </tr>
            </tbody>
            <tbody>
                {list.map((item, i) => {
                    return (
                        <tr key={item.package_id} className={`border ${item.cancelled ? type === "incoming" ? "bg-yellow-100" : "bg-red-100" : ""}`}>
                            <td className="py-2">{i + 1}</td>
                            <td className="py-2">{item.package_id}</td>
                            <td className={`py-2 ${item?.status === "notmatched" ? "bg-[#fecaca]" : "bg-[#bbf7d0]"} text-black`}>{item.status}</td>
                            <td className="py-2">{DDMMYYHHMMSS(item.timestamp)}</td>
                            <td className="py-2 max-w-40">{item.remarks}</td>
                            <td className="py-2">
                                {item.synced ? item.cancelled ? <AiOutlinePlus className="text-red-600 rotate-45" /> : <MdCheck className="text-green-600" /> : <AiOutlineLoading3Quarters className="text-gray-500 animate-spin" />}
                            </td>
                            <td className="py-2">
                                {type === "outgoing" && <button
                                    className="p-2 mr-1 text-white rounded-full bg-neutral-600"
                                    disabled={!item?._id || !item.synced}
                                    onClick={() => { handleCancel(item._id as string, item.package_id, !item.cancelled) }}
                                >
                                    {item.cancelled ? <IoArrowUndoCircleOutline /> : <MdOutlineCancel />}
                                </button>}
                                <button className="p-2 text-white bg-red-600 rounded-full" disabled={!item?._id} onClick={() => { handleDelete(item._id as string, item.package_id) }}>
                                    <FaRegTrashAlt />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default ScannedList;
