import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./apiEndpoints";

/**
 * Outsource Partner Signup API
 * URL: /api/outsource/auth/signup
 */
export const signupOutsourceApi = async (data) => {
  const config = data instanceof FormData 
    ? { headers: { "Content-Type": "multipart/form-data" } } 
    : {};

  const response = await axiosInstance.post(
    "/api/outsource/auth/signup",
    data,
    config
  );
  return response.data;
};

/**
 * Outsource Partner Login API
 * URL: /api/outsource/auth/login
 * Body: { email, password }
 */
export const loginOutsourceApi = async ({ email, password }) => {
  const response = await axiosInstance.post(
    "/api/outsource/auth/login",
    { email, password }
  );
  return response.data;
};

/**
 * Forgot Password - Send OTP
 * URL: /api/outsource/auth/forgot-password
 * Body: { email }
 */
export const forgotPasswordApi = async (email) => {
  const response = await axiosInstance.post(
    "/api/outsource/auth/forgot-password",
    { email }
  );
  return response.data;
};

/**
 * Verify OTP
 * URL: /api/outsource/auth/verify-otp
 * Body: { email, otp }
 */
export const verifyOtpApi = async ({ email, otp }) => {
  const response = await axiosInstance.post(
    "/api/outsource/auth/verify-otp",
    { email, otp }
  );
  return response.data;
};

/**
 * Resend OTP
 * URL: /api/outsource/auth/resend-otp
 * Body: { email }
 */
export const resendOtpApi = async (email) => {
  const response = await axiosInstance.post(
    "/api/outsource/auth/resend-otp",
    { email }
  );
  return response.data;
};

export const resetPassword = async ({ resetToken, newPassword }) => {
  const response = await axiosInstance.post(
    "/api/outsource/auth/reset-password",
    { resetToken, newPassword }
  );
  return response.data;
};

export const getprofileApi = async () => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.PROFILE.GET
  );
  return response.data;
};

export const updateProfileApi = async (updateData) => {
  const isFormData = updateData instanceof FormData;
  const config = isFormData
    ? { headers: { "Content-Type": undefined } }
    : {};

  try {
    const response = await axiosInstance.put(
      API_ENDPOINTS.PROFILE.UPDATE,
      updateData,
      config
    );
    return response.data;
  } catch (error) {
    // If backend failed on FormData with 500, attempt fallback with 'profilePic' field
    if (isFormData && updateData.has("logo")) {
      try {
        const fallbackForm = new FormData();
        for (const [key, value] of updateData.entries()) {
          if (key === "logo") {
            fallbackForm.append("profilePic", value);
          } else {
            fallbackForm.append(key, value);
          }
        }
        const fallbackRes = await axiosInstance.put(
          API_ENDPOINTS.PROFILE.UPDATE,
          fallbackForm,
          config
        );
        return fallbackRes.data;
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    throw error;
  }
};


export const authApi = {
  signup: signupOutsourceApi,
  login: loginOutsourceApi,
  forgot: forgotPasswordApi,
  verifyOtp: verifyOtpApi,
  resendOtp: resendOtpApi,
  resetPassword: resetPassword,
  getProfile: getprofileApi,
  updateProfile: updateProfileApi,
};

export default authApi;
