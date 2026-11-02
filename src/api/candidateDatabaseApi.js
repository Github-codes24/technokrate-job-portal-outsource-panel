import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./apiEndpoints";

export const candidateDatabaseApi = {
  // Fetch dropdown categories
  getCategories: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CANDIDATE_DATABASE.DROPDOWN_CATEGORIES
    );
    return response.data;
  },

  // Fetch dropdown subcategories by categoryId
  getSubcategories: async (categoryId) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CANDIDATE_DATABASE.DROPDOWN_SUBCATEGORIES(categoryId)
    );
    return response.data;
  },

  //fetch dropdown desginations by sub-categoryid
  getDesignations: async (subcategoryId) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CANDIDATE_DATABASE.DROPDOWN_DESIGNATIONS(subcategoryId)
    );
    return response.data;
  },

  // 5. List own candidate database records
  // GET /api/outsource/candidate-database?page=1&limit=5&search=
  listRecords: async (params = {}) => {
    const { page = 1, limit = 5, search = "" } = params;
    const query = new URLSearchParams();
    if (page) query.append("page", page);
    if (limit) query.append("limit", limit);
    if (search) query.append("search", search);

    const response = await axiosInstance.get(
      `${API_ENDPOINTS.CANDIDATE_DATABASE.LIST}?${query.toString()}`
    );
    return response.data;
  },

  // 4. Upload database
  // POST /api/outsource/candidate-database (multipart/form-data)
  uploadDatabase: async (formData) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.CANDIDATE_DATABASE.UPLOAD,
      formData
    );
    return response.data;
  },

  // 6. View one
  // GET /api/outsource/candidate-database/:id
  getRecordById: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CANDIDATE_DATABASE.DETAILS(id)
    );
    return response.data;
  },

  // 7. Edit
  // PUT /api/outsource/candidate-database/:id (form-data: category, subCategory, designation, file)
  updateDatabase: async (id, formData) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.CANDIDATE_DATABASE.UPDATE(id),
      formData
    );
    return response.data;
  },

  // 8. Delete
  // DELETE /api/outsource/candidate-database/:id
  deleteDatabase: async (id) => {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.CANDIDATE_DATABASE.DELETE(id)
    );
    return response.data;
  },

  // 9. Download
  // GET /api/outsource/candidate-database/:id/download
  downloadDatabase: async (id) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CANDIDATE_DATABASE.DOWNLOAD(id),
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};

export default candidateDatabaseApi;
