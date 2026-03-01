import axios from "axios";

let apiURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Robust URL handling: 
// 1. Remove trailing slash if present
if (apiURL && apiURL.endsWith('/')) {
  apiURL = apiURL.slice(0, -1);
}

// 2. Auto-fix: Ensure it ends with /api if it looks like our production or local backend
if (apiURL && !apiURL.endsWith('/api') && (apiURL.includes('onrender.com') || apiURL.includes('localhost'))) {
  apiURL = `${apiURL}/api`;
}

console.log('Final API baseURL:', apiURL);

const axiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token will be managed by AuthContext to ensure tab isolation

export default axiosInstance;
