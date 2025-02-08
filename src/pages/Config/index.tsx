import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegTrashAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useConfig } from "../../contexts/ConfigContext";

const Config = () => {
    const { token } = useAuth();
    const { config, setConfig } = useConfig();
    const [channelToAdd, setChannelToAdd] = useState<string>("");
    const [courierToAdd, setCourierToAdd] = useState<string>("");

    const handleConfigUpdate = async (configkey: string, value: string[]) => {
        try {
            const response = await fetch(new URL(`/v1/config/${configkey}`, import.meta.env.VITE_API_BASE_URL), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ options: value })
            });
            if (response.ok) {
                const json: { title: string, options: string[] } = await response.json();
                setConfig(prev => {
                    return {
                        ...prev,
                        [json.title]: json.options
                    }
                });
                toast.success("Configuration updated");
            }
            // TODO - response code handling
        } catch (err) {
            console.error(`Request to POST:/v1/config/${configkey} failed with error `, err);
        }
    }

    return (
        <div className="p-8">
            <div className="mb-6 text-2xl font-bold">System Configuration</div>
            <div className="flex flex-wrap gap-16">
                <div>
                    <div className="mb-2 text-xl font-medium">Channels</div>
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="p-2 border rounded outline-none border-neutral-300" value={channelToAdd} onChange={(e) => { setChannelToAdd(e.target.value) }} />
                        <button
                            className="btn-primary"
                            onClick={() => {
                                if (channelToAdd) {
                                    setChannelToAdd("");
                                    if (config.channel?.some(item => item.toLowerCase() === channelToAdd.toLowerCase())) {
                                        return toast.error(`${channelToAdd} already exists!`);
                                    }
                                    handleConfigUpdate("channel", [...(config.channel || []), channelToAdd]);
                                }
                            }}
                        >Add</button>
                    </div>
                    <div>
                        {config.channel?.map(item => {
                            return (
                                <div key={item} className="flex items-center justify-between p-2 mb-2 border rounded border-neutral-300 bg-neutral-100">
                                    <div>{item}</div>
                                    <button
                                        className="p-2 text-white bg-red-600 rounded-full"
                                        onClick={() => {
                                            handleConfigUpdate("channel", config.channel?.filter(itm => itm !== item) || [])
                                        }}
                                    >
                                        <FaRegTrashAlt />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-xl font-medium">Couriers</div>
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="p-2 border rounded outline-none border-neutral-300" value={courierToAdd} onChange={(e) => { setCourierToAdd(e.target.value) }} />
                        <button
                            className="btn-primary"
                            onClick={() => {
                                if (courierToAdd) {
                                    setCourierToAdd("");
                                    if (config.courier?.some(item => item.toLowerCase() === courierToAdd.toLowerCase())) {
                                        return toast.error(`${courierToAdd} already exists!`);
                                    }
                                    handleConfigUpdate("courier", [...(config.courier || []), courierToAdd]);
                                }
                            }}
                        >Add</button>
                    </div>
                    <div>
                        {config.courier?.map(item => {
                            return (
                                <div key={item} className="flex items-center justify-between p-2 mb-2 border rounded border-neutral-300 bg-neutral-100">
                                    <div>{item}</div>
                                    <button
                                        className="p-2 text-white bg-red-600 rounded-full"
                                        onClick={() => {
                                            handleConfigUpdate("courier", config.courier?.filter(itm => itm !== item) || [])
                                        }}
                                    >
                                        <FaRegTrashAlt />
                                    </button>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Config;
