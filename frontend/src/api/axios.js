import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if trying to access protected routes
      const isProtectedRoute = error.config.url.includes('/profile') && 
                              error.config.method !== 'get';
      if (isProtectedRoute) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("isAdmin");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;