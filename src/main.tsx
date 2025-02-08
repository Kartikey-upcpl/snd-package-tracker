import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ConfigProvider } from "./contexts/ConfigContext.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ConfigProvider>
                    <App />
                </ConfigProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
