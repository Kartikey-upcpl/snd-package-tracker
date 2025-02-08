import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo-stacked.png";

const Login = () => {

    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        try {
            toast.loading("Logging in", { id: "LT" })
            const response = await fetch(new URL("/v1/login", import.meta.env.VITE_API_BASE_URL), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Invalid credentials", { id: "LT" });
                }
                if (response.status === 500) {
                    toast.error("Internal server error, contact developer", { id: "LT" })
                }
                console.error(`Request to POST:/v1/login failed with status ${response.status}`, response);
                return;
            }
            const json = await response.json();
            login(json.token, json.user);
            toast.success("Logged in", { id: "LT" });
            navigate("/")
        } catch (err) {
            console.error(`Request to POST:/v1/login failed with error ${err}`);
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            }
        });
    }

    return (
        <div className="flex w-screen h-screen">
            <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] w-3/5 h-full"></div>
            <div className="flex flex-col items-center justify-center w-2/5 h-full">
                <img src={logo} alt="StarAndDaisy" className="mb-2 w-36" />
                <h2 className="mb-24 text-3xl font-semibold">Package Tracker</h2>
                <h4 className="mb-8 text-xl font-medium">Login to system</h4>
                <form onSubmit={handleFormSubmit} className="mb-24">
                    <div className="mb-2">
                        <label htmlFor="username" className="font-medium">Username</label>
                        <input id="username" name="username" value={formData.username} onChange={handleInputChange} required className="w-72 block rounded border border-gray-300 bg-gray-50 p-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="password" className="font-medium">Password</label>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="w-72 block rounded border border-gray-300 bg-gray-50 p-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-72 btn-primary">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
