import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axios";
import {
  updateUser,
  clearSelectedUser,
  selectSelectedUser,
  selectUserById,
} from "../../features/users/usersSlice";
import { toast } from "sonner";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function EditUser() {
  useDocumentTitle("Edit user")
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux store
  const selectedUser = useSelector(selectSelectedUser);
  const userFromStore = useSelector((state) => selectUserById(state, id));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        let userData = null;

        if (selectedUser && selectedUser._id === id) {
          userData = selectedUser;// used when i already clicked edit so the data is already in my store
        } else if (userFromStore) {//check the user in the store
          userData = userFromStore;
        } else {
          setLoading(true);
          const res = await axiosInstance.get(`/admin/update/${id}`);
          userData = res.data;
        }

        if (userData) {
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
          });
          setError("");
        }
      } catch (err) {
        setError("Failed to fetch user data. Please try again.");
        console.error("Fetch user error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initializeUserData();
    }

    return () => {
      dispatch(clearSelectedUser());
    };
  }, [id, selectedUser, userFromStore, dispatch]);

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
      console.log("Admin is trying to edit user with ID:", id);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      const res = await axiosInstance.patch(`/admin/update/${id}`, payload);

      console.log("User updated successfully:", res.data);

      dispatch(updateUser({ id: id, userData: payload }));

      toast.success("User updated successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(error.response?.data?.message || "Failed to update user. Please try again.");
    }
  };

  const handleCancel = () => {
    dispatch(clearSelectedUser());
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Edit User Details</h2>
        <p className="text-sm text-gray-500">Update user information</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter user name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter user email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
