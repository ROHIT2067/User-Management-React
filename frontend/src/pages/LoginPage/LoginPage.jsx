import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccessful } from "../../features/auth/authSlice";
import axiosInstance from "../../utils/axios";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { toast } from "sonner";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  useDocumentTitle("Sign In")
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
      const res = await axiosInstance.post("/user/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      const { user, accessToken } = res.data;
      console.log("the acc token when login : ", accessToken);
      
      dispatch(loginSuccessful({ user, accessToken }));
      navigate("/user/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Sign In">
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/user/register"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign up here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
