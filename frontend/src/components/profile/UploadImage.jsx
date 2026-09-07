import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../utils/axios";
import { loginSuccessful } from "../../features/auth/authSlice";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadImage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;

    if (!allowedTypes.includes(file.type) || !allowedExtensions.test(file.name)) {
      toast.error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed. PDF and non-image files are not permitted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", user.email);

    try {
      setUploading(true);
      const res = await axiosInstance.post("/user/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(
        loginSuccessful({
          user: res.data.user,
          accessToken: accessToken,
        })
      );
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
        <img
          src={user?.profileImage || "https://via.placeholder.com/150"}
          alt="Avatar"
          style={styles.avatar}
        />
        <label htmlFor="imageUpload" style={styles.uploadLabel}>
          {uploading ? (
            <Loader2 style={{ ...styles.cameraIcon, animation: "spin 2s linear infinite" }} />
          ) : (
            <Camera style={styles.cameraIcon} />
          )}
          <input
            type="file"
            id="imageUpload"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            style={styles.hiddenInput}
          />
        </label>
      </div>
      <p style={styles.hint}>Click the camera icon to upload a photo</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  imageWrapper: {
    position: "relative",
    width: "120px",
    height: "120px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #3b82f6",
  },
  uploadLabel: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#3b82f6",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.2s",
  },
  cameraIcon: {
    width: "18px",
    height: "18px",
    color: "white",
  },
  hiddenInput: {
    display: "none",
  },
  hint: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#6b7280",
  },
};
