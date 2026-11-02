import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../api";

/**
 * Async Thunk for Outsource Company Signup
 * Calls: POST https://new-job-portal-be-dh8v.onrender.com/api/outsource/auth/signup
 */
export const signupOutsourceCompany = createAsyncThunk(
  "signup/signupOutsourceCompany",
  async (signupPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(signupPayload);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to register outsource company. Please try again."
      );
    }
  }
);

const signupSlice = createSlice({
  name: "signup",
  initialState: {
    loading: false,
    success: false,
    error: null,
    registeredData: null,
  },
  reducers: {
    resetSignupState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.registeredData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupOutsourceCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signupOutsourceCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.registeredData = action.payload?.data || null;
      })
      .addCase(signupOutsourceCompany.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetSignupState } = signupSlice.actions;
export default signupSlice.reducer;
