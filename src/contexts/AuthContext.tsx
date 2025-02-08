import { createContext, useContext, useEffect, useState } from "react";

type TAuthUser = {
    sub: string,
    role: "root" | "manager" | "administrator" | "executive",
    name: string,
    username: string
}

type TAuthContext = {
    token: string | null,
    user: TAuthUser | null,
    login: (token: string, user: TAuthUser) => void,
    logout: () => void,
    isAuthenticated: () => boolean
}

type TAuthProvider = {
    children: React.ReactNode
}

const AuthContext = createContext<TAuthContext | undefined>(undefined);

const AuthProvider: React.FC<TAuthProvider> = ({ children }) => {

    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<TAuthUser | null>(JSON.parse(localStorage.getItem("user") as string));

    const login = (token: string, user: TAuthUser) => {
        setToken(token);
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
    }

    const isAuthenticated = () => !!token;

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") as string);
        if (token) {
            setToken(token);
            setUser(user);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            token,
            user,
            login,
            logout,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
}

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        console.error("useAuth must be used within an AuthProvider");
    }
    return context as TAuthContext;
}

export { AuthProvider, useAuth };
