// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";

// import logo from "../../assets/img/logo.png";
// import rightImg from "../../assets/img/forgot password 1.png";
// import rightSideBG from "../../assets/img/Vector.png";
// import Skip from "../skip/skip";

// const EnterOTP = () => {
//   const navigate = useNavigate();

//   const [show, setShow] = useState(false);

//   const [formData, setFormData] = useState({
//     otp: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("Form Data:", formData);

//     // You can navigate or handle login later
//     navigate("/reset-password");
//   };

//   return (
//     <div className="min-h-screen flex bg-white relative overflow-hidden">

//       {/* SKIP */}
//       <Skip />

//       {/* LEFT SIDE */}
//       <div className="w-full lg:w-[60%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20">

//         <img
//           src={logo}
//           alt="logo"
//           className="w-87.5 height-[80px] mb-6"
//         />

//         <div className="w-full max-w-107.5 bg-white shadow-[0_0_8px_0_#585858] rounded-lg px-6 sm:px-10 py-10">

//           <h2 className="text-3xl sm:text-[34px] font-extrabold text-[#7900BA] text-center">
//             Enter OTP
//           </h2>

//           <p className="text-center text-black mt-1.75 mb-5 text-[16px]">
//             OTP was sent to your Email
//           </p>

//           {/* <p className="font-semibold mb-4 text-sm text-center">
//             Sign In to your account
//           </p> */}

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Email */}
//             <div>
//               <label className="text-sm font-normal text-[#141414]">Enter OTP</label>
//               <input
//                 type="text"
//                 name="otp"
//                 placeholder="••••••"
//                 className="w-full h-10.5 mt-1 px-3 border border-[#D3D3D3] rounded-md bg-gray-50 text-sm"
//                 value={formData.otp}
//                 onChange={handleChange}
//               />
//               <div
//                 className="text-right text-xs text-[#F59E0B] mt-1 font-semibold cursor-pointer"
//                 onClick={() => navigate("/login")}
//               >
//                 Back to Sign In
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full h-11.5 bg-[#7900BA] hover:bg-[#5B21B6] text-white rounded-md font-medium"
//             >
//               Verify OTP
//             </button>

//           </form>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="hidden lg:flex w-[50%] items-center justify-center relative">

//         <img
//           src={rightSideBG}
//           className="absolute right-0 top-0 w-125 z-0"
//           alt=""
//         />

//         <img
//           src={rightImg}
//           className="relative z-10 w-115"
//           alt=""
//         />
  
//       </div>
//     </div>
//   );
// };

// export default EnterOTP;








import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP, resendOTP, resetVerifyState } from "../../redux/slice/auth/verifyOtpSlice";

import logo from "../../assets/img/logo.png";
import rightImg from "../../assets/img/forgot password 1.png";
import rightSideBG from "../../assets/img/Vector.png";
import Skip from "../skip/skip";

const EnterOTP = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, resendLoading, success } = useSelector((state) => state.verifyOtp);

  const [formData, setFormData] = useState({
    email: localStorage.getItem("resetEmail") || "",
    otp: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyOTP(formData));
  };

  const handleResend = () => {
    if (!formData.email) return;
    dispatch(resendOTP({ email: formData.email }));
  };

  useEffect(() => {
    if (success) {
      navigate("/reset-password");
      dispatch(resetVerifyState());
    }
  }, [success, navigate, dispatch]);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-white relative overflow-y-auto">
      <Skip />

      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-12 my-auto">
        <img src={logo} alt="logo" className="w-48 sm:w-64 md:w-80 h-auto mb-6 object-contain" />

        <div className="w-full max-w-[440px] bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.08)] rounded-xl px-6 sm:px-10 py-8 sm:py-10 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7900BA] text-center">
            Verify OTP
          </h2>

          <p className="text-center text-black mt-1.75 mb-5 text-[16px]">
            Please Confirm Your Email And Enter The OTP
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
       
            <div>
              <label className="text-sm font-normal text-[#141414]">Registered Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@mail.com"
                className="w-full h-10.5 mt-1 px-3 border border-[#D3D3D3] rounded-md bg-gray-50 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-normal text-[#141414]">Enter OTP</label>
              <input
                type="text"
                name="otp"
                required
                placeholder="••••••"
                className="w-full h-10.5 mt-1 px-3 border border-[#D3D3D3] rounded-md bg-gray-50 text-sm"
                value={formData.otp}
                onChange={handleChange}
              />
              <div className="flex items-center justify-between text-xs mt-2">
                <button
                  type="button"
                  disabled={resendLoading || !formData.email}
                  onClick={handleResend}
                  className="text-[#7900BA] font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
                <span
                  className="text-[#F59E0B] font-semibold cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Back To Sign In
                </span>
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
                "Verify OTP"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-[50%] items-center justify-center relative">
        <img src={rightSideBG} className="absolute right-0 top-0 w-125 z-0" alt="" />
        <img src={rightImg} className="relative z-10 w-115" alt="" />
      </div>
    </div>
  );
};

export default EnterOTP;