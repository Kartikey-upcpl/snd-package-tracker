import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

type TConfig = {
    channel?: string[],
    courier?: string[]
}

type TConfigContext = {
    config: TConfig,
    setConfig: React.Dispatch<React.SetStateAction<TConfig>>
}

type TConfigProvider = {
    children: React.ReactNode
}

const ConfigContext = createContext<TConfigContext | undefined>(undefined);

const ConfigProvider: React.FC<TConfigProvider> = ({ children }) => {
    const { token } = useAuth();
    const [config, setConfig] = useState<TConfig>(JSON.parse(localStorage.getItem("config") as string) || { channel: [], courier: [] });

    useEffect(() => {
        const config: TConfig = JSON.parse(localStorage.getItem("config") as string);
        if (config) {
            setConfig(config);
        }
        const controller = new AbortController();
        (async () => {
            try {
                const response = await fetch(new URL("/v1/config", import.meta.env.VITE_API_BASE_URL), {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    signal: controller.signal
                });
                if (response.ok) {
                    const json: TConfig = await response.json();
                    setConfig(json);
                    localStorage.setItem("config", JSON.stringify(json));
                }
            } catch (err) {
                console.error("Request to GET:/v1/config failed with error ", err);
            }
        })();
        return () => {
            controller.abort();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("config", JSON.stringify(config));
    }, [config]);

    return (
        <ConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </ConfigContext.Provider >
    );
}

const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        console.error("useAuth must be used within an AuthProvider");
    }
    return context as TConfigContext;
}

export { ConfigProvider, useConfig };
