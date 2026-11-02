import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dailyActivityApi } from "../../../api";

// 1. Fetch Dropdown Categories Thunk
export const fetchDailyActivityCategories = createAsyncThunk(
  "dailyActivity/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.getCategories();
      const categories =
        response?.data || response?.categories || (Array.isArray(response) ? response : []);
      return categories;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch daily activity categories"
      );
    }
  }
);

// 2. Fetch Dropdown Subcategories by Category ID Thunk
export const fetchDailyActivitySubcategories = createAsyncThunk(
  "dailyActivity/fetchSubcategories",
  async (categoryId, { rejectWithValue }) => {
    try {
      if (!categoryId) return [];
      const response = await dailyActivityApi.getSubcategories(categoryId);
      const subcategories =
        response?.data ||
        response?.subcategories ||
        response?.subCategories ||
        (Array.isArray(response) ? response : []);
      return subcategories;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch daily activity subcategories"
      );
    }
  }
);

// 3. Fetch Dropdown Designations by Subcategory ID Thunk
export const fetchDailyActivityDesignations = createAsyncThunk(
  "dailyActivity/fetchDesignations",
  async (subcategoryId, { rejectWithValue }) => {
    try {
      if (!subcategoryId) return [];
      const response = await dailyActivityApi.getDesignations(subcategoryId);
      const designations =
        response?.data ||
        response?.designations ||
        (Array.isArray(response) ? response : []);
      return designations;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch daily activity designations"
      );
    }
  }
);

// 4. Fetch Indian States Thunk
export const fetchDailyActivityStates = createAsyncThunk(
  "dailyActivity/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.getStates();
      const states =
        response?.data || (Array.isArray(response) ? response : []);
      return states;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch states"
      );
    }
  }
);

// 5. Fetch Cities by State Name Thunk
export const fetchDailyActivityCities = createAsyncThunk(
  "dailyActivity/fetchCities",
  async (stateName, { rejectWithValue }) => {
    try {
      if (!stateName) return [];
      const response = await dailyActivityApi.getCitiesByState(stateName);
      const cities =
        response?.data || (Array.isArray(response) ? response : []);
      return cities;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch cities"
      );
    }
  }
);

// 6. Fetch List of Daily Activities Thunk (with pagination, search, status, date)
export const fetchDailyActivities = createAsyncThunk(
  "dailyActivity/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.listDailyActivities(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch daily activities"
      );
    }
  }
);

// 7. Create Daily Activity Thunk
export const createDailyActivity = createAsyncThunk(
  "dailyActivity/create",
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.createDailyActivity(activityData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to create daily activity"
      );
    }
  }
);

// 8. Update Daily Activity Thunk
export const updateDailyActivity = createAsyncThunk(
  "dailyActivity/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.updateDailyActivity(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to update daily activity"
      );
    }
  }
);

// 9. Fetch Single Daily Activity Details Thunk
export const fetchDailyActivityById = createAsyncThunk(
  "dailyActivity/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.getDailyActivityById(id);
      return response?.data || response?.activity || response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch daily activity details"
      );
    }
  }
);

// 10. Delete Daily Activity Thunk
export const deleteDailyActivity = createAsyncThunk(
  "dailyActivity/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.deleteDailyActivity(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to delete daily activity"
      );
    }
  }
);

// 11. Block / Unblock Candidate Activity Thunk
export const blockDailyActivity = createAsyncThunk(
  "dailyActivity/block",
  async ({ id, isBlocked }, { rejectWithValue }) => {
    try {
      const response = await dailyActivityApi.blockDailyActivity(id, { isBlocked });
      return { id, isBlocked, response };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to block/unblock activity"
      );
    }
  }
);

const initialState = {
  // Activities List & Pagination
  activities: [],
  pagination: {
    page: 1,
    limit: 5,
    totalRecords: 0,
    totalPages: 1,
  },
  loadingActivities: false,
  errorActivities: null,

  // Selected Activity Details (for View / Edit)
  currentActivity: null,
  loadingCurrentActivity: false,
  errorCurrentActivity: null,

  // Create / Update
  submittingActivity: false,
  activitySuccess: false,
  errorSubmit: null,

  // Delete
  deletingActivity: false,
  errorDelete: null,

  // Categories
  categories: [],
  loadingCategories: false,
  errorCategories: null,

  // Subcategories
  subcategories: [],
  loadingSubcategories: false,
  errorSubcategories: null,

  // Designations
  designations: [],
  loadingDesignations: false,
  errorDesignations: null,

  // States
  states: [],
  loadingStates: false,
  errorStates: null,

  // Cities
  cities: [],
  loadingCities: false,
  errorCities: null,
};

const dailyActivitySlice = createSlice({
  name: "dailyActivity",
  initialState,
  reducers: {
    clearDailyActivityError: (state) => {
      state.errorCategories = null;
      state.errorSubcategories = null;
      state.errorDesignations = null;
      state.errorStates = null;
      state.errorCities = null;
      state.errorActivities = null;
      state.errorSubmit = null;
      state.errorDelete = null;
    },
    clearSubcategories: (state) => {
      state.subcategories = [];
      state.errorSubcategories = null;
    },
    clearDesignations: (state) => {
      state.designations = [];
      state.errorDesignations = null;
    },
    clearCities: (state) => {
      state.cities = [];
      state.errorCities = null;
    },
    resetActivitySubmitState: (state) => {
      state.submittingActivity = false;
      state.activitySuccess = false;
      state.errorSubmit = null;
    },
    clearCurrentActivity: (state) => {
      state.currentActivity = null;
      state.loadingCurrentActivity = false;
      state.errorCurrentActivity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities List
      .addCase(fetchDailyActivities.pending, (state) => {
        state.loadingActivities = true;
        state.errorActivities = null;
      })
      .addCase(fetchDailyActivities.fulfilled, (state, action) => {
        state.loadingActivities = false;
        const payload = action.payload;
        // Support { data: [...], pagination: {...} } or { activities: [...] } or array directly
        const list =
          payload?.data?.activities ||
          payload?.data?.reports ||
          payload?.data ||
          payload?.activities ||
          (Array.isArray(payload) ? payload : []);
        state.activities = Array.isArray(list) ? list : [];

        if (payload?.pagination) {
          state.pagination = {
            page: payload.pagination.page || 1,
            limit: payload.pagination.limit || 5,
            totalRecords: payload.pagination.totalRecords || payload.pagination.total || list.length,
            totalPages: payload.pagination.totalPages || Math.ceil((payload.pagination.totalRecords || list.length) / (payload.pagination.limit || 5)) || 1,
          };
        } else if (payload?.total !== undefined || payload?.totalPages !== undefined) {
          state.pagination = {
            page: payload.page || 1,
            limit: payload.limit || 5,
            totalRecords: payload.total || list.length,
            totalPages: payload.totalPages || Math.ceil((payload.total || list.length) / (payload.limit || 5)) || 1,
          };
        } else {
          state.pagination = {
            page: 1,
            limit: 5,
            totalRecords: state.activities.length,
            totalPages: Math.ceil(state.activities.length / 5) || 1,
          };
        }
      })
      .addCase(fetchDailyActivities.rejected, (state, action) => {
        state.loadingActivities = false;
        state.errorActivities = action.payload;
      })

      // Create Activity
      .addCase(createDailyActivity.pending, (state) => {
        state.submittingActivity = true;
        state.activitySuccess = false;
        state.errorSubmit = null;
      })
      .addCase(createDailyActivity.fulfilled, (state, action) => {
        state.submittingActivity = false;
        state.activitySuccess = true;
        const created = action.payload?.data || action.payload?.activity || action.payload;
        if (created && typeof created === "object") {
          state.activities.unshift(created);
        }
      })
      .addCase(createDailyActivity.rejected, (state, action) => {
        state.submittingActivity = false;
        state.errorSubmit = action.payload;
      })

      // Update Activity
      .addCase(updateDailyActivity.pending, (state) => {
        state.submittingActivity = true;
        state.activitySuccess = false;
        state.errorSubmit = null;
      })
      .addCase(updateDailyActivity.fulfilled, (state, action) => {
        state.submittingActivity = false;
        state.activitySuccess = true;
        const updated = action.payload?.data || action.payload?.activity || action.payload;
        if (updated && (updated._id || updated.id)) {
          const uId = updated._id || updated.id;
          state.activities = state.activities.map((a) =>
            (a._id === uId || a.id === uId) ? updated : a
          );
        }
      })
      .addCase(updateDailyActivity.rejected, (state, action) => {
        state.submittingActivity = false;
        state.errorSubmit = action.payload;
      })

      // Fetch Single Activity Details
      .addCase(fetchDailyActivityById.pending, (state) => {
        state.loadingCurrentActivity = true;
        state.errorCurrentActivity = null;
      })
      .addCase(fetchDailyActivityById.fulfilled, (state, action) => {
        state.loadingCurrentActivity = false;
        state.currentActivity = action.payload;
      })
      .addCase(fetchDailyActivityById.rejected, (state, action) => {
        state.loadingCurrentActivity = false;
        state.errorCurrentActivity = action.payload;
      })

      // Delete Activity
      .addCase(deleteDailyActivity.pending, (state) => {
        state.deletingActivity = true;
        state.errorDelete = null;
      })
      .addCase(deleteDailyActivity.fulfilled, (state, action) => {
        state.deletingActivity = false;
        const delId = action.payload?.id;
        if (delId) {
          state.activities = state.activities.filter(
            (a) => a._id !== delId && a.id !== delId
          );
        }
      })
      .addCase(deleteDailyActivity.rejected, (state, action) => {
        state.deletingActivity = false;
        state.errorDelete = action.payload;
      })

      // Block Activity
      .addCase(blockDailyActivity.fulfilled, (state, action) => {
        const { id, isBlocked } = action.payload || {};
        if (id) {
          state.activities = state.activities.map((item) => {
            if (item._id === id || item.id === id) {
              return { ...item, isBlocked };
            }
            return item;
          });
          if (state.currentActivity && (state.currentActivity._id === id || state.currentActivity.id === id)) {
            state.currentActivity = { ...state.currentActivity, isBlocked };
          }
        }
      })

      // Categories
      .addCase(fetchDailyActivityCategories.pending, (state) => {
        state.loadingCategories = true;
        state.errorCategories = null;
      })
      .addCase(fetchDailyActivityCategories.fulfilled, (state, action) => {
        state.loadingCategories = false;
        state.categories = action.payload;
      })
      .addCase(fetchDailyActivityCategories.rejected, (state, action) => {
        state.loadingCategories = false;
        state.errorCategories = action.payload;
      })

      // Subcategories
      .addCase(fetchDailyActivitySubcategories.pending, (state) => {
        state.loadingSubcategories = true;
        state.errorSubcategories = null;
      })
      .addCase(fetchDailyActivitySubcategories.fulfilled, (state, action) => {
        state.loadingSubcategories = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchDailyActivitySubcategories.rejected, (state, action) => {
        state.loadingSubcategories = false;
        state.errorSubcategories = action.payload;
      })

      // Designations
      .addCase(fetchDailyActivityDesignations.pending, (state) => {
        state.loadingDesignations = true;
        state.errorDesignations = null;
      })
      .addCase(fetchDailyActivityDesignations.fulfilled, (state, action) => {
        state.loadingDesignations = false;
        state.designations = action.payload;
      })
      .addCase(fetchDailyActivityDesignations.rejected, (state, action) => {
        state.loadingDesignations = false;
        state.errorDesignations = action.payload;
      })

      // States
      .addCase(fetchDailyActivityStates.pending, (state) => {
        state.loadingStates = true;
        state.errorStates = null;
      })
      .addCase(fetchDailyActivityStates.fulfilled, (state, action) => {
        state.loadingStates = false;
        state.states = action.payload;
      })
      .addCase(fetchDailyActivityStates.rejected, (state, action) => {
        state.loadingStates = false;
        state.errorStates = action.payload;
      })

      // Cities
      .addCase(fetchDailyActivityCities.pending, (state) => {
        state.loadingCities = true;
        state.errorCities = null;
      })
      .addCase(fetchDailyActivityCities.fulfilled, (state, action) => {
        state.loadingCities = false;
        state.cities = action.payload;
      })
      .addCase(fetchDailyActivityCities.rejected, (state, action) => {
        state.loadingCities = false;
        state.errorCities = action.payload;
      });
  },
});

export const {
  clearDailyActivityError,
  clearSubcategories,
  clearDesignations,
  clearCities,
  resetActivitySubmitState,
  clearCurrentActivity,
} = dailyActivitySlice.actions;

export default dailyActivitySlice.reducer;

