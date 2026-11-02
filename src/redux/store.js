import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../redux/slice/auth/loginSlice";
import signupReducer from "../redux/slice/auth/signupSlice";
import forgotPassReducer from "../redux/slice/auth/forgotPassSlice";
import verifyOtpReducer from "../redux/slice/auth/verifyOtpSlice";
import resetPassReducer from "../redux/slice/auth/resetPassSlice";
import profileReducer from "../redux/slice/profile/profileSlice";
import vacancyReducer from "../redux/slice/vacancy/vacancySlice";
import candidateDatabaseReducer from "../redux/slice/candidate/candidateDatabaseSlice";
import dailyActivityReducer from "../redux/slice/activity/dailyActivitySlice";
import dashboardReducer from "../redux/slice/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: loginReducer,
    signup: signupReducer,
    forgotPass: forgotPassReducer,
    verifyOtp: verifyOtpReducer,
    resetPass: resetPassReducer,
    profile: profileReducer,
    vacancy: vacancyReducer,
    candidateDatabase: candidateDatabaseReducer,
    dailyActivity: dailyActivityReducer,
    dashboard: dashboardReducer,
  },
});
