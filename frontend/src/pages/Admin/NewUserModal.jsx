import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "../../utils/axios";
import { X, ArrowLeft, Eye, EyeOff } from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function NewUserModal() {
  useDocumentTitle("Add new user")
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("admin is trying to add new user");

    if (!formData.name.trim()) {
      toast.error("Full Name is required");
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (formData.name.trim().length > 50) {
      toast.error("Name cannot exceed 50 characters");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axiosInstance.post("/admin/add", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("new user added successfully ", res.data);
      toast.success("User added successfully!");
      
      // Reset form and navigate back to dashboard
      setFormData({ name: "", email: "", password: "" });
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("new user added error", error);
      toast.error(error.response?.data?.message || "Failed to add user. Please try again.");
    }
  };

  const handleClose = () => navigate(-1); // Close or go back to previous page
  const handleBack = () => navigate(-1); // Go back

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 relative">
        {/* Top navigation buttons */}
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-red-600 transition"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center mt-4">
          <h2 className="text-2xl font-bold text-slate-800">Add New User</h2>
          <p className="text-sm text-slate-600">Fill out the details to register a user</p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition pr-10"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-md transition duration-300 shadow"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}
