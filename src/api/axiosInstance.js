import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://new-job-portal-be-dh8v.onrender.com";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

// Request interceptor to attach bearer token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "mock-token-12345") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If payload is FormData, remove hardcoded Content-Type application/json to let browser set boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for uniform error formatting & auth session expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid / expired / not authorized
    if (error?.response?.status === 401) {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("userProfile");
        // Redirect to login if user is inside a protected route
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    const errorData = error?.response?.data;
    const errorsList = Array.isArray(errorData?.errors) && errorData.errors.length > 0
      ? errorData.errors.join(", ")
      : null;
    const message =
      errorsList ||
      errorData?.message ||
      error?.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
