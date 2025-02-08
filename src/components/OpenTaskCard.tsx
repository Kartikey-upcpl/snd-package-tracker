import { Link } from "react-router-dom";
import { DDMMYYYY, HHMMSSZZ } from "../utils/date";

const OpenTaskCard = (props: TTaskPopulated) => {
    return (
        <div className="transition-shadow bg-white border rounded border-neutral-300 w-80 hover:shadow-lg">
            <Link to={`${props._id}`}>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 font-mono font-bold bg-yellow-200 rounded">ID: {props.task_id}</div>
                        <div className="font-bold">
                            <div className="">{HHMMSSZZ(props.created_at)}</div>
                            <div className="text-xs">{DDMMYYYY(props.created_at)}</div>
                        </div>
                    </div>
                    <div className="text-lg font-bold">{props.courier} - {props.channel}</div>
                    <div className="text-xs font-medium text-neutral-700">Ex.: {props.created_by.name} ({props.created_by.username})</div>
                </div>
            </Link>
        </div>
    );
}

export default OpenTaskCard;
