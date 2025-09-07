
import axios from "axios";
import { permissionCache } from "./permission-cache";

// Create an axios instance
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - Clearing permission cache");
      
      // Clear all permission caches on 401
      permissionCache.clearAll();
      
      // Optionally, you could also redirect to login or trigger a logout
      // This depends on your auth flow requirements
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
