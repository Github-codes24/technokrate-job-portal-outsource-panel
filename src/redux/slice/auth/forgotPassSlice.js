import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { authApi } from "../../../api";

export const sendForgotPasswordOTP = createAsyncThunk(
  "auth/sendForgotPasswordOTP",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authApi.forgot(email);
      toast.success(response.message || "OTP sent successfully!");
      return response;
    } catch (error) {
      const errorMsg = error?.message || "Failed to send OTP";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Keep sendOTP as alias if any legacy caller uses it
export const sendOTP = sendForgotPasswordOTP;

const forgotPassSlice = createSlice({
  name: "forgotPass",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetForgotState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendForgotPasswordOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendForgotPasswordOTP.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendForgotPasswordOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetForgotState } = forgotPassSlice.actions;
export default forgotPassSlice.reducer;