import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "../auth/loginSlice";

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://new-job-portal-be-dh8v.onrender.com";
const BASE_URL = RAW_BASE_URL.replace(/\/api\/?$/, "");

const normalizeAndCacheProfile = (profileData) => {
  if (!profileData) return null;
  const companyName = profileData.companyName || profileData.name || profileData.hrName || "";
  const contactNumber = profileData.contactNumber || profileData.phone || profileData.mobileNumber || "";
  const logoUrl =
    profileData.logo?.url ||
    (typeof profileData.logo === "string" ? profileData.logo : "") ||
    profileData.image?.url ||
    (typeof profileData.image === "string" ? profileData.image : "") ||
    profileData.profilePic ||
    "";

  const normalized = {
    id: profileData.id || profileData._id || "",
    _id: profileData._id || profileData.id || "",
    companyName: companyName,
    name: companyName,
    hrName: profileData.hrName || profileData.name || companyName,
    designation: profileData.designation || "",
    contactNumber: contactNumber,
    phone: contactNumber,
    mobileNumber: contactNumber,
    email: profileData.email || "",
    status: profileData.status || "Pending",
    isApproved: profileData.isApproved ?? false,
    registrationSource: profileData.registrationSource || "Self_Signup",
    profilePic: logoUrl,
    logo: profileData.logo || { url: logoUrl, public_id: "" },
    image: profileData.image || { url: logoUrl, public_id: "" },
    isActive: profileData.isActive ?? true,
    createdAt: profileData.createdAt,
    updatedAt: profileData.updatedAt,
  };

  try {
    localStorage.setItem("userProfile", JSON.stringify(normalized));
    window.dispatchEvent(new Event("profileUpdate"));
  } catch (storageError) {
    console.error("Failed to update userProfile in localStorage", storageError);
  }

  return normalized;
};

import { authApi } from "../../../api";

// GET HR Profile
export const fetchHRProfile = createAsyncThunk(
  "profile/fetchHRProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      const profileData = response?.data || response?.user || response;
      const normalized = normalizeAndCacheProfile(profileData);
      return { data: normalized || profileData };
    } catch (error) {
      // Fallback to cached profile if offline
      const cached = localStorage.getItem("userProfile");
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      return rejectWithValue(error?.message || "Failed to fetch HR profile");
    }
  }
);

// UPDATE HR Profile
export const updateHRProfile = createAsyncThunk(
  "profile/updateHRProfile",
  async (updateData, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(updateData);
      const profileData = response?.data || response?.user || response;
      const normalized = normalizeAndCacheProfile(profileData);
      return { data: normalized || profileData, message: response?.message };
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to update HR profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    loading: false,
    updating: false,
    error: null,
    updateError: null,
    updateSuccess: false,
  },
  reducers: {
    setProfileData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.updating = false;
      state.error = null;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetUpdateStatus: (state) => {
      state.updating = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchHRProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHRProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || action.payload;
        state.error = null;
      })
      .addCase(fetchHRProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateHRProfile.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateHRProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.data = action.payload?.data || action.payload;
        state.updateError = null;
      })
      .addCase(updateHRProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateSuccess = false;
        state.updateError = action.payload;
      });
  },
});

export const { setProfileData, clearProfile, resetUpdateStatus } = profileSlice.actions;
export default profileSlice.reducer;
