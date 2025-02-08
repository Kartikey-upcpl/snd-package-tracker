import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import OpenTaskCard from "../../components/OpenTaskCard";
import PageLoading from "../../components/PageLoading";
import useFetch from "../../hooks/useFetch";

const OpenTasks = () => {

    const location = useLocation();
    const [search, setSearch] = useState<string>("");
    const tasktype: ("outgoing" | "incoming") = location.pathname.split("/")[1] === "incoming" ? "incoming" : "outgoing";
    const { response, loading } = useFetch<{ metadata: {}, data: TTaskPopulated[] } | null>(`/v1/tasks?is_open=true&type=${tasktype}`, null);

    return (
        loading ? <PageLoading /> : <div className="p-8">
            <div className="flex justify-between mb-4">
                <div className="text-2xl font-bold">{tasktype[0].toUpperCase() + tasktype.slice(1)} Tasks {response?.data && `(${response?.data.length})`}</div>
                <div className="flex gap-4">
                    <Link to="create">
                        <button className="btn-primary">Create Task</button>
                    </Link>
                    <div className="flex mb-2">
                        <div className="px-4 py-2 font-medium border border-r-0 rounded-tl rounded-bl border-neutral-300 bg-neutral-100">
                            <label htmlFor="task_id">Task ID</label>
                        </div>
                        <input
                            name="task_id"
                            id="task_id"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value) }}
                            placeholder="Search"
                            className="p-2 border rounded-tr rounded-br outline-none border-neutral-300"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap w-full gap-4">
                {!loading && response?.data && response.data
                    .filter(task => !search || task.task_id.includes(search))
                    .map(task => {
                        return <OpenTaskCard key={task._id} {...task} />
                    })}
            </div>
        </div>
    );
}

export default OpenTasks;
