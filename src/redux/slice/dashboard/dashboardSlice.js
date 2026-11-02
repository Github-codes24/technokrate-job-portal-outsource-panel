import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "../../../api";

// Fetch Dashboard Overview Thunk
// GET /api/outsource/dashboard
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getDashboardData();
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
