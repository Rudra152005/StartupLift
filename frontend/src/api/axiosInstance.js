import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log('API baseURL configured as:', apiURL);

const axiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 30000, // 30 second timeout - increased for slower endpoints
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token will be managed by AuthContext to ensure tab isolation

export default axiosInstance;
