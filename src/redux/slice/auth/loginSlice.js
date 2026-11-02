import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { authApi } from "../../../api";

export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Backend returns: { success: true, token, data: user } or { success: true, token, user }
      const token = response?.token || response?.data?.token;
      const user = response?.data || response?.user || { email };

      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("loginEmail", email);
      if (user) {
        localStorage.setItem("userProfile", JSON.stringify(user));
      }

      return { success: true, token, user };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Invalid email or password"
      );
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.success = false;
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
        toast.success("Login Successfully!");
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer;