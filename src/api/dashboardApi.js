import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./apiEndpoints";

export const dashboardApi = {
  // GET /api/outsource/dashboard
  getDashboardData: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.GET);
    return response.data;
  },
};

export default dashboardApi;
