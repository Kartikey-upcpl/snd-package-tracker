import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { CODE } from "../utils/response";


const useFetch = <T>(route: string, initial: T) => {
    const { token, logout } = useAuth();
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [response, setResponse] = useState<T>(initial);
    const refresh = () => {
        setCount(prev => prev + 1);
    }
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setLoading(true);
            try {
                const response = await fetch(new URL(route, import.meta.env.VITE_API_BASE_URL), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    signal: controller.signal
                });
                if (!response.ok) {
                    if (CODE[response.status]) toast.error(CODE[response.status].message);
                    if (response.status === 401) logout();
                    console.error(`Request to GET:${route} failed with status ${response.status}`);
                    return;
                }
                setResponse(await response.json());
                setLoading(false);
            } catch (err: any) {
                console.error(`Request to GET:${route} failed with error ${err}`);
            }
        })();
        return () => {
            controller.abort();
        }
    }, [route, count]);
    return { response, loading, count, refresh };
}

export default useFetch;
