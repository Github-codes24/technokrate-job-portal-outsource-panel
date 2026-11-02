import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { resetPassword, resetState } from "../../redux/slice/auth/resetPassSlice";

import logo from "../../assets/img/logo.png";
import rightImg from "../../assets/img/Reset password-amico 1.png";
import rightSideBG from "../../assets/img/Vector.png";
import Skip from "../skip/skip";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, success, error } = useSelector((state) => state.resetPass);

  const [show, setShow] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    ConfPassword: "",
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    } else {
      toast.error("Email not found. Please start the process again.");
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (success) {
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetToken");
      dispatch(resetState());
      navigate("/password-reset-success");
    }
  }, [success, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.ConfPassword) {
      toast.error("Passwords Do Not Match!");
      return;
    }

    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      toast.error("Reset token not found. Please verify your OTP again.");
      navigate("/otp");
      return;
    }

    dispatch(
      resetPassword({
        resetToken,
        newPassword: formData.newPassword,
      })
    );
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-white relative overflow-y-auto">
      <Skip />

      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-12 my-auto">
        <img src={logo} alt="logo" className="w-48 sm:w-64 md:w-80 h-auto mb-6 object-contain" />

        <div className="w-full max-w-[440px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.08)] rounded-xl px-6 sm:px-10 py-8 sm:py-10 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7900BA] text-center leading-tight">
            Reset Password
          </h2>

          <p className="text-center text-gray-500 mt-2 text-sm">
            Resetting Password For: <span className="font-semibold text-black">{userEmail}</span>
          </p>

          {error && <p className="text-red-500 text-xs text-center mt-2 bg-red-50 py-1 rounded">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label className="text-sm font-normal text-[#141414]">Enter New Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  name="newPassword"
                  placeholder="••••••"
                  className="w-full h-10.5 mt-1 px-3 border border-[#D3D3D3] rounded-md bg-gray-50 text-sm focus:outline-none focus:border-[#7900BA]"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                <span onClick={() => setShow(!show)} className="absolute right-3 top-3.25 cursor-pointer text-gray-400">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-normal text-[#141414]">Confirm New Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  name="ConfPassword"
                  placeholder="••••••"
                  className="w-full h-10.5 mt-1 px-3 border border-[#D3D3D3] rounded-md bg-gray-50 text-sm focus:outline-none focus:border-[#7900BA]"
                  value={formData.ConfPassword}
                  onChange={handleChange}
                  required
                />
                <span onClick={() => setShow(!show)} className="absolute right-3 top-3.25 cursor-pointer text-gray-400">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <div className="text-right text-xs text-[#F59E0B] mt-1 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/login")}>
                Back To Sign In
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11.5 bg-[#7900BA] hover:bg-[#5B21B6] text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex w-[50%] items-center justify-center relative">
        <img src={rightSideBG} className="absolute right-0 top-0 w-125 z-0" alt="" />
        <img src={rightImg} className="relative z-10 w-115" alt="" />
      </div>
    </div>
  );
};

export default ResetPassword;