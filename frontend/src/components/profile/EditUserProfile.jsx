import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import { loginSuccessful } from "../../features/auth/authSlice";
import Navbar from "../navbar/Navbar";
import UploadImage from "./UploadImage";
import { toast } from "sonner";

export default function EditUserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
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
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("sending profile update req by user id : ", user?.id || user?._id);
      
      const res = await axiosInstance.patch(`/user/update-profile`, {
        id: user?.id || user?._id,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });

      // Update Redux auth state with the returned user data
      dispatch(loginSuccessful({ 
        user: res.data.user, 
        accessToken: accessToken 
      }));
      toast.success("Profile updated successfully!");
      navigate("/user/home");
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMsg = error.response?.data?.message || "Failed to update profile. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar name={user?.name} imageUrl={user?.profileImage} />
      <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Edit Profile</h2>
          <p className="text-sm text-gray-500">Update your personal details</p>
        </div>

        <UploadImage />

        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition font-medium shadow"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/user/home")}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded transition font-medium shadow"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
