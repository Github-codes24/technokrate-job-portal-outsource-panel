import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import logo from "../../assets/img/logo.png";
import rightImg from "../../assets/img/Powerful-bro 1.png";
import rightSideBG from "../../assets/img/Vector.png";
import Skip from "../skip/skip";
import succ from "../../assets/img/success.png"

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-white relative overflow-y-auto">
      <Skip />
      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-12 my-auto">
        <img src={logo} alt="logo" className="w-48 sm:w-64 md:w-80 h-auto mb-6 object-contain" />

        <div className="w-full max-w-[440px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.08)] rounded-xl px-6 sm:px-10 py-8 sm:py-10 border border-gray-100">
          
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img src={succ} alt="success" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7900BA] text-center">
            Password Reset
          </h2>

          <p className="text-center text-black mt-1.75 mb-9 text-[16px]">
            Password reset successfully
          </p>

          <button
            onClick={() => navigate("/login")}
            type="button"
            className="w-full h-11.5 bg-[#7900BA] hover:bg-[#5B21B6] text-white rounded-md font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
      <div className="hidden lg:flex w-[50%] items-center justify-center relative">
        <img
          src={rightSideBG}
          className="absolute right-0 top-0 w-125 z-0"
          alt=""
        />

        <img src={rightImg} className="relative z-10 w-115" alt="" />
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
