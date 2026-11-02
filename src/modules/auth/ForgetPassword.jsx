import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP, resetForgotState } from "../../redux/slice/auth/forgotPassSlice";

import logo from "../../assets/img/logo.png";
import rightImg from "../../assets/img/forgot password 1.png";
import rightSideBG from "../../assets/img/Vector.png";
import Skip from "../skip/skip";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, success } = useSelector((state) => state.forgotPass);

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("resetEmail", formData.email);
    dispatch(sendOTP(formData));
  };

  useEffect(() => {
    if (success) {
      navigate("/otp");
      dispatch(resetForgotState());
    }
  }, [success, navigate, dispatch]);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-white relative overflow-y-auto">
      <Skip />

      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-12 my-auto">
        <img
          src={logo}
          alt="logo"
          className="w-48 sm:w-64 md:w-80 h-auto mb-6 object-contain"
        />

        <div className="w-full max-w-[440px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.08)] rounded-xl px-6 sm:px-10 py-8 sm:py-10 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7900BA] text-center">
            Forgot Password
          </h2>

          <p className="text-center text-black mt-1.75 mb-5 text-[16px]">
            Enter Your Registered HR Email
            <br /> To Receive Reset Link..
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-normal text-[#141414]">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@mail.com"
                className="w-full h-10.5 mt-1 px-3 border border-[#D3D3D3] rounded-md bg-gray-50 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
              <div
                className="text-right text-xs text-[#F59E0B] mt-1 font-semibold cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Back To Sign In
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11.5 bg-[#7900BA] hover:bg-[#5B21B6] text-white rounded-md font-medium flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-[50%] items-center justify-center relative">
        <img
          src={rightSideBG}
          className="absolute right-0 top-0 w-125 z-0"
          alt=""
        />
        <img
          src={rightImg}
          className="relative z-10 w-115"
          alt=""
        />
      </div>
    </div>
  );
};

export default ForgotPassword;