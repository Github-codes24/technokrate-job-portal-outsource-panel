import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginWithEmail } from "../../redux/slice/auth/loginSlice";
import { toast } from "react-toastify";

import logo from "../../assets/img/logo.png";
import Skip from "../skip/skip";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const { loading, error, success } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      await dispatch(loginWithEmail({ email: email.trim(), password })).unwrap();
    } catch (err) {
      toast.error(err || "Invalid email or password");
    }
  };

  useEffect(() => {
    if (success) {
      navigate("/");
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-[#FAFAFA] relative overflow-y-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Skip />

      {/* Logo */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <img src={logo} alt="logo" className="h-12 sm:h-16 md:h-[70px] w-auto object-contain" />
      </div>

      {/* Card container */}
      <div className="w-full max-w-[490px] bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 md:p-10 shadow-[0_4px_25px_0_rgba(0,0,0,0.03)] my-auto">
        <h2 className="text-2xl sm:text-3xl md:text-[38px] font-extrabold text-[#7900BA] text-center tracking-tight leading-none mb-2 sm:mb-3">
          Sign In
        </h2>

        <p className="text-center text-[#1E293B] font-bold text-base sm:text-lg mb-1">
          Sign In to your account
        </p>

        <p className="text-center text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[360px] mx-auto mb-6 sm:mb-8">
          Access your account to discover top talent to build your ideal team.
        </p>

        {/* Email login form */}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          {error && (
            <p className="text-red-500 text-xs text-center font-medium">
              {error}
            </p>
          )}

          <div>
            <label className="text-sm font-semibold text-[#1E293B]">
              Enter Employee Email
            </label>
            <div className="relative mt-1.5">
              <input
                type="email"
                required
                placeholder="employee@company.com"
                className="w-full h-11 px-4 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#7900BA] focus:ring-1 focus:ring-[#7900BA] text-sm font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1E293B]">
              Password
            </label>
            <div className="relative mt-1.5 flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full h-11 pl-4 pr-10 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#7900BA] focus:ring-1 focus:ring-[#7900BA] text-sm font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-[#C5A830] font-bold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11.5 bg-[#7900BA] hover:bg-[#5B21B6] text-white rounded-lg font-bold text-sm flex items-center justify-center shadow-[0_2px_8px_0_rgba(121,0,186,0.2)] hover:shadow-lg disabled:opacity-70 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              "Sign In"
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#7900BA] font-bold hover:underline cursor-pointer transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;
