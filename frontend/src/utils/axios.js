import axios from "axios";
import { store } from "../store";
import { logout, updateAccessToken } from "../features/auth/authSlice";
import STATUS_CODES from "../../constants/statusCodes";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use( 
  (config) => {
    const accessToken = store.getState().auth.accessToken;
    console.log(" Sending accessToken:", accessToken);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === STATUS_CODES.UNAUTHORIZED ||
        error.response?.status === STATUS_CODES.FORBIDDEN) &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry     //prevents an infinite loop
    ) {
      originalRequest._retry = true;

      try {
        const res = await axiosInstance.post(
          "/user/refresh",
          {},
          {
            withCredentials: true,
            skipAuthRefresh: true,
          }   //allows the browser to send the refresh-token cookie with cross-origin requests
        );

        const newAccessToken = res.data.accessToken;
        store.dispatch(updateAccessToken(newAccessToken));

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("Refresh token failed:", refreshError.response?.data);
        store.dispatch(logout()); 
        window.location.href = "/user/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
