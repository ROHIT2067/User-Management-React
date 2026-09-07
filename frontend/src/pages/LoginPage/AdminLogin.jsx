import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccessful } from "../../features/auth/authSlice";
import { toast } from "sonner";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  useDocumentTitle("Admin Login")
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const HandleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!form.password) {
      toast.error("Password is required");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return toast.error(errorData.message || "Admin login failed. Check credentials.");
      }

      const data = await res.json();
      const { user, accessToken } = data;

      console.log("admin access token received : ", accessToken);

      if (!user.isAdmin) {
        return toast.error("You don't have admin access");
      }

      dispatch(loginSuccessful({ user, accessToken }));
      navigate("/admin/dashboard");
    } catch (error) {
      console.log("Error occurred while logging in:", error);
      toast.error("Admin login failed. Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 px-4">
      <form
        noValidate
        onSubmit={HandleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-slate-200"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">Admin Login</h2>
          <p className="text-sm text-slate-600 mt-1">Enter your admin credentials</p>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <input
            onChange={HandleChange}
            name="email"
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              onChange={HandleChange}
              name="password"
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-800 text-white font-semibold py-2 rounded-lg hover:bg-slate-900 transition duration-300 shadow"
        >
          Login
        </button>

        <div className="text-center mt-2">
          <span className="inline-block text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full shadow">
            Admin Access Only
          </span>
        </div>
      </form>
    </div>
  );
}
