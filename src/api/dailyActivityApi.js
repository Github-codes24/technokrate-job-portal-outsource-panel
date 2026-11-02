import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./apiEndpoints";

export const dailyActivityApi = {
  // 1. Fetch Categories for Daily Activity
  getCategories: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DAILY_ACTIVITY.DROPDOWN_CATEGORIES
    );
    return response.data;
  },

  // 2. Fetch Subcategories by Category ID
  getSubcategories: async (categoryId) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DAILY_ACTIVITY.DROPDOWN_SUBCATEGORIES(categoryId)
    );
    return response.data;
  },

  // 3. Fetch Designations by Subcategory ID
  getDesignations: async (subcategoryId) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DAILY_ACTIVITY.DROPDOWN_DESIGNATIONS(subcategoryId)
    );
    return response.data;
  },

  // 4. Fetch Indian States
  getStates: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.LOCATION.STATES);
    return response.data;
  },

  // 5. Fetch Cities by State Name
  getCitiesByState: async (stateName) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.LOCATION.CITIES(stateName)
    );
    return response.data;
  },

  // 6. Create Daily Activity / Report
  createDailyActivity: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.post(
      API_ENDPOINTS.DAILY_ACTIVITY.CREATE,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    );
    return response.data;
  },

  // 7. List Daily Activities
  // GET /api/outsource/daily-activity?page=1&limit=5&search=&status=&date=
  listDailyActivities: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    const queryString = query.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DAILY_ACTIVITY.LIST}?${queryString}`
      : API_ENDPOINTS.DAILY_ACTIVITY.LIST;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // 8. Get Single Daily Activity by ID
  getDailyActivityById: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.DAILY_ACTIVITY.DETAILS(id)
    );
    return response.data;
  },

  // 9. Update Daily Activity
  updateDailyActivity: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.put(
      API_ENDPOINTS.DAILY_ACTIVITY.UPDATE(id),
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    );
    return response.data;
  },

  // 10. Delete Daily Activity
  deleteDailyActivity: async (id) => {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.DAILY_ACTIVITY.DELETE(id)
    );
    return response.data;
  },

  // 11. Block / Unblock Candidate / Activity
  blockDailyActivity: async (id, payload = {}) => {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.DAILY_ACTIVITY.BLOCK(id),
        payload
      );
      return response.data;
    } catch (err) {
      // If server router expects PUT or POST
      try {
        const putRes = await axiosInstance.put(
          API_ENDPOINTS.DAILY_ACTIVITY.BLOCK(id),
          payload
        );
        return putRes.data;
      } catch (putErr) {
        const postRes = await axiosInstance.post(
          API_ENDPOINTS.DAILY_ACTIVITY.BLOCK(id),
          payload
        );
        return postRes.data;
      }
    }
  },
};

export default dailyActivityApi;
