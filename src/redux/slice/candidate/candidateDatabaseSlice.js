import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { candidateDatabaseApi } from "../../../api";

// Fetch Dropdown Categories Thunk
export const fetchDropdownCategories = createAsyncThunk(
  "candidateDatabase/fetchDropdownCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateDatabaseApi.getCategories();
      // Accepts format { data: [...] } or direct array [...] or { success: true, data: [...] }
      const categories = response?.data || response?.categories || (Array.isArray(response) ? response : []);
      return categories;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch candidate categories"
      );
    }
  }
);

// Fetch Dropdown Subcategories by CategoryId Thunk
export const fetchDropdownSubcategories = createAsyncThunk(
  "candidateDatabase/fetchDropdownSubcategories",
  async (categoryId, { rejectWithValue }) => {
    try {
      if (!categoryId) return [];
      const response = await candidateDatabaseApi.getSubcategories(categoryId);
      const subcategories =
        response?.data ||
        response?.subcategories ||
        response?.subCategories ||
        (Array.isArray(response) ? response : []);
      return subcategories;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch candidate subcategories"
      );
    }
  }
);

// fetch dropdown designations by sub-category id thunk
 export const fetchDropdownDesignations = createAsyncThunk(
  "candidateDatabase/fetchDropdownDesignations",
  async (subcategoryId, { rejectWithValue }) => {
    try {
      if (!subcategoryId) return [];
      const response = await candidateDatabaseApi.getDesignations(subcategoryId);
      const designations =
        response?.data ||
        response?.designations ||
        (Array.isArray(response) ? response : []);
      return designations;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch candidate designations"
      );
    }
  }
);

 
 


  

// 5. Fetch own candidate database records
export const fetchCandidateDatabases = createAsyncThunk(
  "candidateDatabase/fetchCandidateDatabases",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await candidateDatabaseApi.listRecords(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch candidate databases"
      );
    }
  }
);

// 4. Upload database (multipart/form-data)
export const uploadCandidateDatabase = createAsyncThunk(
  "candidateDatabase/uploadCandidateDatabase",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await candidateDatabaseApi.uploadDatabase(formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to upload candidate database"
      );
    }
  }
);

// 6. View one
export const fetchCandidateDatabaseById = createAsyncThunk(
  "candidateDatabase/fetchCandidateDatabaseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await candidateDatabaseApi.getRecordById(id);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch candidate database details"
      );
    }
  }
);

// 7. Edit database
export const updateCandidateDatabase = createAsyncThunk(
  "candidateDatabase/updateCandidateDatabase",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await candidateDatabaseApi.updateDatabase(id, formData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update candidate database"
      );
    }
  }
);

// 8. Delete database
export const deleteCandidateDatabase = createAsyncThunk(
  "candidateDatabase/deleteCandidateDatabase",
  async (id, { rejectWithValue }) => {
    try {
      const response = await candidateDatabaseApi.deleteDatabase(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to delete candidate database"
      );
    }
  }
);

// 9. Download database
export const downloadCandidateDatabase = createAsyncThunk(
  "candidateDatabase/downloadCandidateDatabase",
  async ({ id, fileName = "candidate_database.xlsx" }, { rejectWithValue }) => {
    try {
      const responseData = await candidateDatabaseApi.downloadDatabase(id);

      // Check if response is actually a JSON error wrapped in a Blob
      if (responseData instanceof Blob && responseData.type?.includes("application/json")) {
        const text = await responseData.text();
        const json = JSON.parse(text);
        return rejectWithValue(json.message || "Failed to download candidate database");
      }

      const blob = responseData instanceof Blob ? responseData : new Blob([responseData]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const downloadName =
        fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")
          ? fileName
          : `${fileName}.xlsx`;
      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true, fileName: downloadName };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download candidate database"
      );
    }
  }
);

const initialState = {
  categories: [],
  loadingCategories: false,
  errorCategories: null,

  subcategories: [],
  loadingSubcategories: false,
  errorSubcategories: null,

  designations: [],
  loadingDesignations: false,
  errorDesignations: null,

  // Records list & pagination
  databases: [],
  pagination: {
    page: 1,
    limit: 5,
    totalRecords: 0,
    totalPages: 1,
  },
  loadingDatabases: false,
  hasFetchedDatabases: false,
  errorDatabases: null,

  // Upload status
  uploading: false,
  uploadSuccess: false,
  errorUpload: null,
};

const candidateDatabaseSlice = createSlice({
  name: "candidateDatabase",
  initialState,
  reducers: {
    clearCandidateError: (state) => {
      state.errorCategories = null;
      state.errorSubcategories = null;
      state.errorDesignations = null;
      state.errorDatabases = null;
      state.errorUpload = null;
    },
    clearSubcategories: (state) => {
      state.subcategories = [];
      state.errorSubcategories = null;
    },
    clearDesignations: (state) => {
      state.designations = [];
      state.errorDesignations = null;
    },
    resetUploadState: (state) => {
      state.uploading = false;
      state.uploadSuccess = false;
      state.errorUpload = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dropdown Categories
      .addCase(fetchDropdownCategories.pending, (state) => {
        state.loadingCategories = true;
        state.errorCategories = null;
      })
      .addCase(fetchDropdownCategories.fulfilled, (state, action) => {
        state.loadingCategories = false;
        state.categories = action.payload;
      })
      .addCase(fetchDropdownCategories.rejected, (state, action) => {
        state.loadingCategories = false;
        state.errorCategories = action.payload;
      })

      // Fetch Dropdown Subcategories
      .addCase(fetchDropdownSubcategories.pending, (state) => {
        state.loadingSubcategories = true;
        state.errorSubcategories = null;
      })
      .addCase(fetchDropdownSubcategories.fulfilled, (state, action) => {
        state.loadingSubcategories = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchDropdownSubcategories.rejected, (state, action) => {
        state.loadingSubcategories = false;
        state.errorSubcategories = action.payload;
      })

      // Fetch Dropdown Designations
      .addCase(fetchDropdownDesignations.pending, (state) => {
        state.loadingDesignations = true;
        state.errorDesignations = null;
      })
      .addCase(fetchDropdownDesignations.fulfilled, (state, action) => {
        state.loadingDesignations = false;
        state.designations = action.payload;
      })
      .addCase(fetchDropdownDesignations.rejected, (state, action) => {
        state.loadingDesignations = false;
        state.errorDesignations = action.payload;
      })

      // List Own Records
      .addCase(fetchCandidateDatabases.pending, (state) => {
        state.loadingDatabases = true;
        state.errorDatabases = null;
      })
      .addCase(fetchCandidateDatabases.fulfilled, (state, action) => {
        state.loadingDatabases = false;
        state.hasFetchedDatabases = true;
        const payload = action.payload;
        const list =
          payload?.data ||
          payload?.records ||
          payload?.candidates ||
          (Array.isArray(payload) ? payload : []);
        state.databases = list;
        if (payload?.pagination) {
          state.pagination = {
            page: payload.pagination.page || payload.pagination.currentPage || 1,
            limit: payload.pagination.limit || 5,
            totalRecords: payload.pagination.totalRecords || payload.pagination.total || list.length,
            totalPages: payload.pagination.totalPages || Math.ceil((payload.pagination.total || list.length) / (payload.pagination.limit || 5)) || 1,
          };
        } else if (payload?.total !== undefined) {
          state.pagination = {
            page: payload.page || 1,
            limit: payload.limit || 5,
            totalRecords: payload.total,
            totalPages: Math.ceil(payload.total / (payload.limit || 5)) || 1,
          };
        }
      })
      .addCase(fetchCandidateDatabases.rejected, (state, action) => {
        state.loadingDatabases = false;
        state.hasFetchedDatabases = true;
        state.errorDatabases = action.payload;
      })

      // Upload Database
      .addCase(uploadCandidateDatabase.pending, (state) => {
        state.uploading = true;
        state.uploadSuccess = false;
        state.errorUpload = null;
      })
      .addCase(uploadCandidateDatabase.fulfilled, (state) => {
        state.uploading = false;
        state.uploadSuccess = true;
      })
      .addCase(uploadCandidateDatabase.rejected, (state, action) => {
        state.uploading = false;
        state.errorUpload = action.payload;
      })

      // Delete Database
      .addCase(deleteCandidateDatabase.fulfilled, (state, action) => {
        state.databases = state.databases.filter(
          (d) => (d._id || d.id) !== action.payload.id
        );
      });
  },
});

export const {
  clearCandidateError,
  clearSubcategories,
  clearDesignations,
  resetUploadState,
} = candidateDatabaseSlice.actions;
export default candidateDatabaseSlice.reducer;
