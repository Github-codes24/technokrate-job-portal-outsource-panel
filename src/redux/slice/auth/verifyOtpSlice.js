import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { authApi } from "../../../api";

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp({ email, otp });
      toast.success(response.message || "OTP verified successfully!");
      return response;
    } catch (error) {
      const errorMsg = error?.message || "Invalid OTP";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOtp(email);
      toast.success(response.message || "New OTP sent successfully!");
      return response;
    } catch (error) {
      const errorMsg = error?.message || "Failed to resend OTP";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const verifyOtpSlice = createSlice({
  name: "verifyOtp",
  initialState: {
    loading: false,
    resendLoading: false,
    success: false,
    error: null,
    emailForReset: localStorage.getItem("resetEmail") || "",
  },
  reducers: {
    setResetEmail: (state, action) => {
      state.emailForReset = action.payload;
      localStorage.setItem("resetEmail", action.payload);
    },
    resetVerifyState: (state) => {
      state.loading = false;
      state.resendLoading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const resetToken = action.payload?.resetToken || action.payload?.token;
        if (resetToken) {
          localStorage.setItem("resetToken", resetToken);
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.resendLoading = true;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.resendLoading = false;
      })
      .addCase(resendOTP.rejected, (state) => {
        state.resendLoading = false;
      });
  },
});

export const { setResetEmail, resetVerifyState } = verifyOtpSlice.actions;
export default verifyOtpSlice.reducer;