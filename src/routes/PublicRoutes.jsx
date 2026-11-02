import { Route } from "react-router-dom";

import Login from "../modules/auth/Login";
import ForgetPassword from "../modules/auth/ForgetPassword";
import EnterOtp from "../modules/auth/EnterOTP";
import ResetPassword from "../modules/auth/ResetPassword";
import PasswordResetSuccess from "../modules/auth/PasswordResetSuccess";
import GetStarted from "../modules/auth/GetStarted";
import AddForm from "../modules/auth/AddForm";
import LandingPage from "../modules/auth/LandingPage";

const PublicRoutes = () => {
  return [
    <Route key="getStarted" path="/get-started" element={<GetStarted />}/>,
    <Route key="landingPage" path="/landing-page" element={<LandingPage />} />,
    <Route key="signup" path="/signup" element={<AddForm />} />,
    <Route key="login" path="/login" element={<Login />} />,
    <Route key="forgetPassword" path="/forgot-password" element={<ForgetPassword />} />,
    <Route key="enterotp" path="/otp" element={<EnterOtp />} />,
    <Route key="resetPassword" path="/reset-password" element={<ResetPassword />} />,
    <Route key="passwordSuccess" path="/password-reset-success" element={<PasswordResetSuccess />} />,
  ];
};

export default PublicRoutes;