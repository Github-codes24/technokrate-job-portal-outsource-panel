import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { authApi } from "../../../api";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword({
        resetToken,
        newPassword,
      });
      toast.success(response.message || "Password Reset Successfully");
      return response;
    } catch (error) {
      const errorMsg = error?.message || "Failed to reset password";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const resetPassSlice = createSlice({
  name: "resetPass",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        toast.success("Password Reset Successfully!")
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = resetPassSlice.actions;
export default resetPassSlice.reducer;