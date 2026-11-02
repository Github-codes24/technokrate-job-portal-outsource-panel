import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../../components/common/Footer";
import { 
  Building2, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Lock,
  ShieldCheck,
  Edit2,
  Save,
  X as CloseIcon
} from "lucide-react";
import { toast } from "react-toastify";
import { fetchHRProfile, updateHRProfile } from "../../redux/slice/profile/profileSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { data: hrProfile, updating } = useSelector((state) => state.profile);

  const companyData = {
    companyName: hrProfile?.companyName || hrProfile?.hrName || hrProfile?.name || "",
    hrName: hrProfile?.hrName || hrProfile?.name || "",
    email: hrProfile?.email || "",
    contactNumber: hrProfile?.contactNumber || hrProfile?.phone || hrProfile?.mobileNumber || "",
    profilePic:
      hrProfile?.profilePic ||
      hrProfile?.logo?.url ||
      (typeof hrProfile?.logo === "string" ? hrProfile?.logo : "") ||
      hrProfile?.image?.url ||
      (typeof hrProfile?.image === "string" ? hrProfile?.image : "") ||
      null,
    status: hrProfile?.status || "",
    isApproved: hrProfile?.isApproved ?? false,
  };

  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    companyName: "",
    email: "",
    contactNumber: "",
    hrName: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    dispatch(fetchHRProfile());
  }, [dispatch]);

  useEffect(() => {
    if (hrProfile && !isEditing) {
      setEditForm({
        companyName: companyData.companyName,
        email: companyData.email,
        contactNumber: companyData.contactNumber,
        hrName: companyData.hrName
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    }
  }, [hrProfile, isEditing, companyData.companyName, companyData.email, companyData.contactNumber, companyData.hrName]);

  const handleProfileSave = async () => {
    if (!editForm.companyName.trim() || !editForm.email.trim() || !editForm.contactNumber.trim()) {
      toast.error("Please fill all required profile fields");
      return;
    }

    const cleanContact = editForm.contactNumber.replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanContact)) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    const hasPasswordAttempt =
      Boolean(passwordForm.currentPassword) ||
      Boolean(passwordForm.newPassword) ||
      Boolean(passwordForm.confirmNewPassword);

    if (hasPasswordAttempt) {
      if (!passwordForm.currentPassword) {
        toast.error("Please enter your current password to set a new one");
        return;
      }
      if (!passwordForm.newPassword) {
        toast.error("Please enter a new password");
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }
    }

    const payload = {
      companyName: editForm.companyName.trim(),
      email: editForm.email.trim(),
      contactNumber: cleanContact,
    };

    if (editForm.hrName) {
      payload.hrName = editForm.hrName.trim();
    }

    if (hasPasswordAttempt) {
      payload.currentPassword = passwordForm.currentPassword;
      payload.newPassword = passwordForm.newPassword;
      payload.confirmNewPassword = passwordForm.confirmNewPassword;
    }

    try {
      const result = await dispatch(updateHRProfile(payload)).unwrap();
      setIsEditing(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      dispatch(fetchHRProfile());
      toast.success(result?.message || "Profile updated successfully!");
    } catch (err) {
      const errorMsg = typeof err === "string" ? err : err?.message || "Failed to update profile";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-full bg-[#F8F9FF] font-sans flex flex-col justify-between rounded-2xl overflow-hidden">
      <div className="max-w-5xl w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Company Profile</h1>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm font-medium">Manage your security and view your company details.</p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto justify-center bg-[#7900BA] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-purple-200 hover:bg-purple-800 transition flex items-center gap-2 cursor-pointer"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Banner & Info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#7900BA] to-purple-500 w-full relative">
            <div className="absolute inset-0 bg-white/10 pattern-dots opacity-30"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="pt-6 pb-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-gray-900">{companyData.companyName}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                    companyData.status?.toLowerCase() === "approved" || companyData.isApproved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {companyData.status || (companyData.isApproved ? "Approved" : "Pending")}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1">
                <ShieldCheck size={14} className={companyData.isApproved ? "text-emerald-500" : "text-amber-500"}/> 
                {companyData.isApproved ? "Verified Outsource Partner" : "Outsource Partner Verification Pending"}
              </p>
            </div>

            {/* Read Only View */}
            {!isEditing && (
              <div className="mt-6 max-w-2xl">
                <div className="space-y-4">
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Company Name</span>
                      <span className="text-base font-bold text-gray-900">{companyData.companyName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Mail size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Email Address</span>
                        <span className="text-sm font-bold text-gray-900 truncate block">{companyData.email}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Contact Number</span>
                        <span className="text-sm font-bold text-gray-900">{companyData.contactNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Mode View */}
            {isEditing && (
              <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* Left Column: Edit Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Building2 className="text-purple-600" /> Basic Information
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Company Name *</label>
                        <input 
                          type="text" 
                          value={editForm.companyName} 
                          onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Email Address *</label>
                        <input 
                          type="email" 
                          value={editForm.email} 
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Contact Number *</label>
                        <input 
                          type="tel" 
                          value={editForm.contactNumber} 
                          onChange={(e) => setEditForm({...editForm, contactNumber: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Edit Security Settings */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Lock className="text-purple-600" /> Update Password (Optional)
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Current Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword.current ? "text" : "password"} 
                            placeholder="Required to change password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#7900BA] focus:outline-none transition-shadow"
                          />
                          <button type="button" onClick={() => setShowPassword({...showPassword, current: !showPassword.current})} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">New Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword.new ? "text" : "password"} 
                            placeholder="Leave blank to keep current"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#7900BA] focus:outline-none transition-shadow"
                          />
                          <button type="button" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword.confirm ? "text" : "password"} 
                            placeholder="Leave blank to keep current"
                            value={passwordForm.confirmNewPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#7900BA] focus:outline-none transition-shadow"
                          />
                          <button type="button" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save/Cancel Action Bar */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button 
                    disabled={updating}
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={updating}
                    onClick={handleProfileSave}
                    className="px-10 py-3 rounded-xl font-bold text-white bg-[#7900BA] hover:bg-purple-800 transition shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={18} /> {updating ? "Saving..." : "Save All Changes"}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;