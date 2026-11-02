import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./apiEndpoints";

export const vacancyApi = {
  // API 11: Get All Approved Outsource Vacancies (Screen 3 Table)
  // Endpoint: GET /api/admin/outsource/vacancies?search=&status=&category=&priority=&workMode=&page=1&limit=10
  getVacancies: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      category = "",
      priority = "",
      workMode = "",
      timeline = "",
      hiring = "",
      state = "",
      city = "",
      fromDate = "",
      toDate = "",
    } = params;

    const queryParams = new URLSearchParams();
    if (page !== undefined && page !== null) queryParams.append("page", page);
    if (limit !== undefined && limit !== null) queryParams.append("limit", limit);
    if (search !== undefined && search !== null && search !== "") queryParams.append("search", search);
    if (status && status !== "All") queryParams.append("status", status);
    if (category && category !== "All") queryParams.append("category", category);
    if (priority && priority !== "All") queryParams.append("priority", priority);
    if (workMode && workMode !== "All") queryParams.append("workMode", workMode);
    if (timeline && timeline !== "All") queryParams.append("timeline", timeline);
    if (hiring && hiring !== "All") queryParams.append("hiring", hiring);
    if (state && state !== "All") queryParams.append("state", state);
    if (city && city !== "All") queryParams.append("city", city);
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);

    const queryString = queryParams.toString();
    const adminEndpoint = `${API_ENDPOINTS.VACANCIES.ADMIN_APPROVED_LIST}${queryString ? `?${queryString}` : ""}`;
    const outsourceEndpoint = `${API_ENDPOINTS.VACANCIES.LIST}${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await axiosInstance.get(adminEndpoint);
      return response.data;
    } catch (adminError) {
      // If admin endpoint returns 404 or fails, fallback to outsource vacancies endpoint
      if (adminError?.response?.status === 404 || adminError?.response?.status === 403) {
        const fallbackResponse = await axiosInstance.get(outsourceEndpoint);
        return fallbackResponse.data;
      }
      throw adminError;
    }
  },

  // Get Outsource Vacancy Stats
  getVacancyStats: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.VACANCIES.STATS);
    return response.data;
  },

  // Get Single Vacancy Details by ID
  getVacancyById: async (id) => {
    const response = await axiosInstance.get(API_ENDPOINTS.VACANCIES.DETAILS(id));
    return response.data;
  },

  // Submit Candidate Application for a Vacancy
  applyVacancy: async (id, payload) => {
    const response = await axiosInstance.post(API_ENDPOINTS.VACANCIES.APPLY(id), payload);
    return response.data;
  },

  // Get Vacancy Applications
  getVacancyApplications: async (id, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "All") {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `${API_ENDPOINTS.VACANCIES.APPLICATIONS(id)}${queryString ? `?${queryString}` : ""}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  // Get Single Application Details
  getApplicationDetails: async (applicationId, vacancyId) => {
    const endpoint = API_ENDPOINTS.VACANCIES.APPLICATION_DETAILS(applicationId, vacancyId);
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },
};

export default vacancyApi;
