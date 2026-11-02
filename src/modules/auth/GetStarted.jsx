import React, { useState } from "react";
import logos from "../../assets/img/logo.png"
import image from "../../assets/img/Image.png"
import { useNavigate } from "react-router-dom";

const GetStarted = () => {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-purple-300 px-4 py-4 sm:py-8 overflow-y-auto">
            <div className="max-w-xl w-full text-center flex flex-col items-center my-auto">
                {/* Logo */}
                <div className="w-full flex justify-center mb-2 sm:mb-4">
                    <img
                        src={logos}
                        alt="Technokrate Logo"
                        className="w-40 sm:w-56 md:w-[260px] max-w-full h-auto object-contain"
                    />
                </div>

                {/* Heading */}
                <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-[#141414] mt-1 mb-0.5 sm:mb-2 tracking-tight">
                    Find The Right Talent For Your
                </h2>

                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#7900BA] mb-2 sm:mb-4">
                    Organization
                </h3>

                {/* Illustration */}
                <div className="flex justify-center my-1 sm:my-3">
                    <img
                        src={image}
                        alt="Job Search"
                        className="w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300"
                    />
                </div>

                {/* Description */}
                <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-md px-3 leading-relaxed">
                    Discover Qualified Candidates That Match Your Company’s Requirements And Culture.
                </p>

                {/* Button */}
                <button
                    onClick={() => navigate("/landing-page")}
                    className="w-full max-w-[240px] sm:max-w-xs sm:w-auto bg-[#7900BA] hover:bg-[#6800a0] active:scale-95 text-white rounded-lg px-8 sm:px-14 md:px-18 py-2.5 sm:py-3 shadow-md hover:shadow-xl text-sm sm:text-base md:text-lg font-medium transition-all duration-200 cursor-pointer"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};
export default GetStarted