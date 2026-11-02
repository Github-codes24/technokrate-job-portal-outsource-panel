import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { signupOutsourceCompany } from '../../redux/slice/auth/signupSlice';

const AddForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.signup);
    const [showPassword, setShowPassword] = useState(false);
    
    // Add state for form fields
    const [formData, setFormData] = useState({
        companyType: '',
        companyName: '',
        hrName: '',
        email: '',
        password: '',
        mobileNumber: '',
        profilePic: '',
        rawFile: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    profilePic: reader.result,
                    rawFile: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!formData.companyName.trim()) {
            toast.error("Company Name is required");
            return;
        }
        if (!formData.hrName.trim()) {
            toast.error("HR Name is required");
            return;
        }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return;
        }
        if (!formData.password) {
            toast.error("Password is required");
            return;
        }
        if (!formData.mobileNumber.trim()) {
            toast.error("Mobile Number is required");
            return;
        }

        // Prepare payload - use FormData if an image file was selected
        let payload;
        if (formData.rawFile) {
            payload = new FormData();
            if (formData.companyType) payload.append('companyType', formData.companyType);
            payload.append('companyName', formData.companyName.trim());
            payload.append('hrName', formData.hrName.trim());
            payload.append('email', formData.email.trim().toLowerCase());
            payload.append('password', formData.password);
            payload.append('mobileNumber', formData.mobileNumber.trim());
            payload.append('logo', formData.rawFile);
        } else {
            payload = {
                ...(formData.companyType && { companyType: formData.companyType }),
                companyName: formData.companyName.trim(),
                hrName: formData.hrName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                mobileNumber: formData.mobileNumber.trim(),
            };
        }

        try {
            const resultAction = await dispatch(signupOutsourceCompany(payload));

            if (signupOutsourceCompany.fulfilled.match(resultAction)) {
                const res = resultAction.payload;
                toast.success(res?.message || "Outsource Company registered successfully!");

                // Save user reference for easy autofill on login
                localStorage.setItem("loginEmail", formData.email.trim());
                localStorage.setItem("loginPhone", formData.mobileNumber.trim());
                localStorage.setItem("loginName", formData.companyName.trim());
                if (formData.profilePic) {
                    localStorage.setItem("loginPic", formData.profilePic);
                }

                navigate("/login");
            } else {
                const errMessage = resultAction.payload || "Signup failed. Please try again.";
                toast.error(errMessage);
            }
        } catch (err) {
            toast.error(err?.message || "An unexpected error occurred during signup.");
        }
    };

    return (
        <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center mb-4 sm:mb-6 gap-3 sm:gap-4 max-w-[1000px] mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={18} className="text-gray-700" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Outsource Account</h1>
            </div>

            {/* Form Container */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-8 max-w-[1000px] mx-auto">
                
                {/* Profile Pic Upload */}
                {/* <div className="mb-8 flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center overflow-hidden mb-3 group cursor-pointer">
                        {formData.profilePic ? (
                            <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={32} className="text-purple-300" />
                        )}
                        
                        <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload size={20} className="text-white mb-1" />
                            <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Upload</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="hidden" 
                            />
                        </label>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Company Logo</span>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Company Type Dropdown */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700"> Select Company Type</label>
                        <select 
                            name="companyType"
                            value={formData.companyType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3.5 bg-[#F4F6F9] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#8931BA]/20 transition-all text-gray-700 placeholder:text-gray-400"
                        >
                            
                            <option value="Company">Company</option>
                            <option value="Freelancer Recruiter">Freelancer Recruiter</option>
                            <option value="Consultancy">Consultancy</option>
                        </select>
                    </div>

                    {/* Company Name Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                        <input 
                            type="text" 
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Enter Company Name" 
                            className="w-full px-4 py-3.5 bg-[#F4F6F9] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#8931BA]/20 transition-all text-gray-700 placeholder:text-gray-400"
                        />
                    </div>

                    {/* HR Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Name</label>
                        <input 
                            type="text" 
                            name="hrName"
                            value={formData.hrName}
                            onChange={handleInputChange}
                            placeholder="Enter Name" 
                            className="w-full px-4 py-3.5 bg-[#F4F6F9] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#8931BA]/20 transition-all text-gray-700 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="pihu@gmail.com" 
                            className="w-full px-4 py-3.5 bg-[#F4F6F9] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#8931BA]/20 transition-all text-gray-700 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="........" 
                                className="w-full px-4 py-3.5 bg-[#F4F6F9] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#8931BA]/20 transition-all text-gray-700 placeholder:text-gray-400 pr-12"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                        <input 
                            type="tel" 
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            placeholder="Enter Mobile Number" 
                            className="w-full px-4 py-3.5 bg-[#F4F6F9] border-none rounded-xl outline-none focus:ring-2 focus:ring-[#8931BA]/20 transition-all text-gray-700 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-8 sm:mt-12">
                    <button 
                        type="button"
                        disabled={loading}
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-6 sm:px-10 py-3 rounded-xl font-semibold text-[#8931BA] bg-[#F3E8FF] hover:bg-purple-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        disabled={loading}
                        onClick={handleCreate}
                        className="w-full sm:w-auto px-6 sm:px-10 py-3 rounded-xl font-semibold text-white bg-[#8931BA] hover:bg-purple-800 transition-colors shadow-lg shadow-purple-500/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddForm;
