import { useEffect, useState } from "react";

const Latency = () => {
    const [latency, setLatency] = useState<number>(0);
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        const interval = setInterval(async () => {
            const start = performance.now();
            try {
                const response = await fetch(new URL("/ping", import.meta.env.VITE_API_BASE_URL));
                await response.text();
                const end = performance.now();
                setLatency(Math.round(end - start));
                setIsOnline(true);
            } catch (err) {
                setIsOnline(false);
            }
        }, 10000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        window.addEventListener("online", () => setIsOnline(false));
        window.addEventListener("offline", () => setIsOnline(false));

        return () => {
            window.removeEventListener("online", () => setIsOnline(false));
            window.removeEventListener("offline", () => setIsOnline(false));
        };
    }, []);

    return (
        <div className="flex items-center gap-1">
            <div className={`rounded-full size-3 ${isOnline ? latency < 30 ? "bg-green-500" : latency < 100 ? "bg-yellow-500" : "bg-red-500" : "bg-gray-500"}`}></div>
            <div className="flex items-center gap-1 text-sm font-bold">
                {isOnline ? "Online" : "Offline"}
                <div className="text-xs text-gray-500">({("00" + latency).slice(-3)})</div>
            </div>
        </div>
    );
}

export default Latency;
