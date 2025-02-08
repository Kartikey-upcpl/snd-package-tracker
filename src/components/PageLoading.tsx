import { BiLoader } from "react-icons/bi";

const PageLoading = () => {
    return (
        <div className="flex items-center justify-center bg-slate-300 size-full">
            <div className="flex flex-col items-center justify-center px-6 py-4 bg-white rounded-md shadow-lg opacity-85">
                <div className="mb-2 text-3xl animate-[spin_2s_linear_infinite]"><BiLoader /></div>
                <div className="font-medium">Loading</div>
            </div>
        </div>
    );
}

export default PageLoading;
