import { useConfig } from "../contexts/ConfigContext";
import { FaDownload } from "react-icons/fa";

const Reconciliation = () => {
    const { config } = useConfig();

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="text-2xl font-bold">Reconciliation</div>
                <form action={new URL("/v1/template", import.meta.env.VITE_API_BASE_URL).toString()} method="GET" target="_blank">
                    <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 transition-colors border border-blue-700 rounded hover:text-white hover:bg-blue-700">
                        <FaDownload /> Template
                    </button>
                </form>
            </div>

            <form action={new URL("/v1/reconcile", import.meta.env.VITE_API_BASE_URL).toString()} method="POST" target="_blank" encType="multipart/form-data">
                <div className="flex gap-2 mb-4">
                    <div className="flex">
                        <div className="w-24 p-2 font-medium border border-r-0 rounded-tl rounded-bl border-neutral-300 bg-neutral-100">
                            <label htmlFor="channel">Channel</label>
                        </div>
                        <select name="channel" id="channel" className="w-48 p-2 border rounded-tr rounded-br outline-none border-neutral-300">
                            <option value="" hidden>Select</option>
                            {config.channel?.map(item => {
                                return <option value={item}>{item}</option>
                            })}
                        </select>
                    </div>
                    <div className="flex">
                        <div className="w-24 p-2 font-medium border border-r-0 rounded-tl rounded-bl border-neutral-300 bg-neutral-100">
                            <label htmlFor="courier">Courier</label>
                        </div>
                        <select name="courier" id="courier" className="w-48 p-2 border rounded-tr rounded-br outline-none border-neutral-300">
                            <option value="" hidden>Select</option>
                            {config.courier?.map(item => {
                                return <option value={item}>{item}</option>
                            })}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-center w-full mb-4">
                    <label htmlFor="sheet" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">CSV</p>
                        </div>
                        <input id="sheet" name="sheet" type="file" required className="p-2 text-sm font-medium text-gray-500 border-2 border-gray-300 border-dashed rounded" />
                    </label>
                </div>

                <button className="btn-primary">Reconcile</button>
            </form>
        </div>
    );
}

export default Reconciliation;
