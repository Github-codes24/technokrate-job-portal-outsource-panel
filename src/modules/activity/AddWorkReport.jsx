import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Bold, Italic, Underline } from "lucide-react";
import { State, City } from "country-state-city";
import { toast } from "react-toastify";
import CustomDropdown from "../../components/common/CustomDropdown";
import {
  CATEGORY_OPTIONS,
  ALL_ROLES,
  ROLES_BY_CATEGORY,
  DESIGNATIONS_BY_ROLE,
  DEFAULT_DESIGNATIONS,
  STATUS_OPTIONS,
  INTERACTION_TYPE_OPTIONS,
} from "./activityData";
import {
  fetchDailyActivityCategories,
  fetchDailyActivitySubcategories,
  fetchDailyActivityDesignations,
  fetchDailyActivityStates,
  fetchDailyActivityCities,
  createDailyActivity,
  clearSubcategories,
  clearDesignations,
  clearCities,
} from "../../redux/slice/activity/dailyActivitySlice";

// Fallback Indian states using country-state-city
const INDIAN_STATES_FALLBACK = State.getStatesOfCountry("IN");

const AddWorkReport = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    categories: apiCategories,
    loadingCategories,
    subcategories: apiSubcategories,
    loadingSubcategories,
    designations: apiDesignations,
    loadingDesignations,
    states: apiStates,
    loadingStates,
    cities: apiCities,
    loadingCities,
  } = useSelector((state) => state.dailyActivity || {});

  // Form State
  const [reportDate, setReportDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [formData, setFormData] = useState({
    candidateName: "",
    email: "",
    category: "",
    role: "",
    designation: "",
    education: "",
    phoneNumber: "",
    interactionType: "Call",
    status: "",
    skills: "",
    state: "",
    stateCode: "",
    city: "",
    notes: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial dropdown categories and states on mount
  useEffect(() => {
    dispatch(fetchDailyActivityCategories());
    dispatch(fetchDailyActivityStates());
  }, [dispatch]);

  // Normalized Category Objects: { id, name }
  const categoryObjects = useMemo(() => {
    if (Array.isArray(apiCategories) && apiCategories.length > 0) {
      return apiCategories.map((c) => ({
        id: c._id || c.id || c.name,
        name: c.name || c.categoryName || String(c),
      }));
    }
    return CATEGORY_OPTIONS.map((cat) => ({ id: cat, name: cat }));
  }, [apiCategories]);

  // Category dropdown options for CustomDropdown
  const categoryOptions = useMemo(() => {
    return categoryObjects.map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, [categoryObjects]);

  // Normalized Subcategory Objects: { id, name }
  const subCategoryObjects = useMemo(() => {
    if (Array.isArray(apiSubcategories) && apiSubcategories.length > 0) {
      return apiSubcategories.map((s) => ({
        id: s._id || s.id || s.name || s.subcategoryName,
        name: s.name || s.subcategoryName || s.role || String(s),
      }));
    }
    // Fallback based on selected category
    const fallbackList =
      formData.category && ROLES_BY_CATEGORY[formData.category]
        ? ROLES_BY_CATEGORY[formData.category]
        : ALL_ROLES;
    return fallbackList.map((role) => ({ id: role, name: role }));
  }, [apiSubcategories, formData.category]);

  // Subcategory dropdown options for CustomDropdown
  const subCategoryOptions = useMemo(() => {
    return subCategoryObjects.map((s) => ({
      value: s.name,
      label: s.name,
    }));
  }, [subCategoryObjects]);

  // Normalized Designation Objects: { id, name }
  const designationObjects = useMemo(() => {
    if (Array.isArray(apiDesignations) && apiDesignations.length > 0) {
      return apiDesignations.map((d) => ({
        id: d._id || d.id || d.name || d.designationName,
        name: d.name || d.designationName || String(d),
      }));
    }
    // Fallback based on selected role
    let list = [];
    if (formData.role && DESIGNATIONS_BY_ROLE[formData.role]) {
      list = [...DESIGNATIONS_BY_ROLE[formData.role]];
    } else {
      list = [...DEFAULT_DESIGNATIONS];
    }
    if (!list.includes("Intern")) {
      list.unshift("Intern");
    }
    return list.map((d) => ({ id: d, name: d }));
  }, [apiDesignations, formData.role]);

  // Designation dropdown options for CustomDropdown
  const designationOptions = useMemo(() => {
    return designationObjects.map((d) => ({
      value: d.name,
      label: d.name,
    }));
  }, [designationObjects]);

  // States dropdown options
  const stateOptions = useMemo(() => {
    if (Array.isArray(apiStates) && apiStates.length > 0) {
      return apiStates.map((st) => ({
        value: st.name || st,
        label: st.name || st,
        isoCode: st.isoCode || "",
      }));
    }
    return INDIAN_STATES_FALLBACK.map((st) => ({
      value: st.name,
      label: st.name,
      isoCode: st.isoCode,
    }));
  }, [apiStates]);

  // Cities dropdown options
  const cityOptions = useMemo(() => {
    if (Array.isArray(apiCities) && apiCities.length > 0) {
      return apiCities.map((ct) => {
        const cityName = typeof ct === "string" ? ct : ct.name || ct.cityName;
        return { value: cityName, label: cityName };
      });
    }
    // Fallback using country-state-city if available
    if (formData.stateCode) {
      const fallbackCities = City.getCitiesOfState("IN", formData.stateCode);
      return fallbackCities.map((ct) => ({ value: ct.name, label: ct.name }));
    }
    return [];
  }, [apiCities, formData.stateCode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (selectedName) => {
    setFormData((prev) => ({
      ...prev,
      category: selectedName,
      role: "",
      designation: "",
    }));

    // Find the category object to get its ID for subcategories API call
    const matchedCategory = categoryObjects.find(
      (c) => c.name === selectedName || c.id === selectedName
    );
    const categoryIdToFetch = matchedCategory?.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(categoryIdToFetch);

    if (categoryIdToFetch && isMongoId) {
      dispatch(fetchDailyActivitySubcategories(categoryIdToFetch));
    } else {
      dispatch(clearSubcategories());
    }
    dispatch(clearDesignations());
  };

  const handleRoleChange = (selectedRoleName) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRoleName,
      designation: "",
    }));

    // Find the subcategory object to get its ID for designations API call
    const matchedSubCategory = subCategoryObjects.find(
      (s) => s.name === selectedRoleName || s.id === selectedRoleName
    );
    const subCategoryIdToFetch = matchedSubCategory?.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(subCategoryIdToFetch);

    if (subCategoryIdToFetch && isMongoId) {
      dispatch(fetchDailyActivityDesignations(subCategoryIdToFetch));
    } else {
      dispatch(clearDesignations());
    }
  };

  const handleStateChange = (selectedStateName) => {
    const foundState = stateOptions.find(
      (s) => s.value === selectedStateName || s.label === selectedStateName
    );
    const stateIso = foundState?.isoCode || "";

    setFormData((prev) => ({
      ...prev,
      state: selectedStateName,
      stateCode: stateIso,
      city: "", // Reset city
    }));

    if (selectedStateName) {
      dispatch(fetchDailyActivityCities(selectedStateName));
    } else {
      dispatch(clearCities());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.candidateName.trim()) {
      toast.error("Candidate Name is required!");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email Address is required!");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required!");
      return;
    }
    if (!formData.role) {
      toast.error("Role (Sub-Category) is required!");
      return;
    }
    if (!formData.designation) {
      toast.error("Designation is required!");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Phone Number is required!");
      return;
    }
    if (!formData.status) {
      toast.error("Candidate Status is required!");
      return;
    }

    setIsSubmitting(true);

    const newReportItem = {
      id: Date.now(),
      name: formData.candidateName,
      candidateName: formData.candidateName,
      email: formData.email,
      category: formData.category,
      role: formData.role,
      subCategory: formData.role,
      designation: formData.designation,
      position: `${formData.role} - ${formData.designation}`,
      education: formData.education || "N/A",
      phoneNumber: formData.phoneNumber,
      phone: formData.phoneNumber,
      interactionType: formData.interactionType || "Call",
      status: formData.status,
      skills: formData.skills,
      date: reportDate,
      state: formData.state,
      stateCode: formData.stateCode,
      city: formData.city,
      notes: formData.notes,
      resumeName: resumeFile ? resumeFile.name : null,
    };

    // Match IDs from normalized dropdown objects
    const matchedCategory = categoryObjects.find(
      (c) => c.name === formData.category || c.id === formData.category
    );
    const matchedSubCategory = subCategoryObjects.find(
      (s) => s.name === formData.role || s.id === formData.role
    );
    const matchedDesignation = designationObjects.find(
      (d) => d.name === formData.designation || d.id === formData.designation
    );

    const categoryId = matchedCategory?.id || formData.category;
    const subCategoryId = matchedSubCategory?.id || formData.role;
    const designationId = matchedDesignation?.id || formData.designation;

    // Prepare JSON payload with both phoneNumber and phone to satisfy backend validator
    const cleanPhone = formData.phoneNumber.trim();
    const skillsArray = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const apiPayload = {
      candidateName: formData.candidateName.trim(),
      email: formData.email.trim(),
      category: categoryId,
      subCategory: subCategoryId,
      designation: designationId,
      education: formData.education.trim(),
      phoneNumber: cleanPhone,
      phone: cleanPhone,
      contactNumber: cleanPhone,
      mobileNumber: cleanPhone,
      interactionType: formData.interactionType || "Call",
      status: formData.status || "Pending",
      keySkills: skillsArray,
      skills: formData.skills.trim(),
      reportDate: reportDate,
      state: formData.state || "",
      city: formData.city || "",
      notes: formData.notes || "",
      description: formData.notes || "",
      additionalNotes: formData.notes || "",
      resumeName: resumeFile ? resumeFile.name : null,
    };

    // Convert resumeFile to base64 data URL if present
    const readResumeBase64 = () => {
      return new Promise((resolve) => {
        if (!resumeFile) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(resumeFile);
      });
    };

    try {
      const resumeDataUrl = await readResumeBase64();
      const createdResponse = await dispatch(createDailyActivity(apiPayload)).unwrap();
      const createdId = createdResponse?.data?._id || createdResponse?.data?.id || createdResponse?._id || createdResponse?.id;
      
      // Cache local report record with resumeName and resumeDataUrl
      try {
        const stored = JSON.parse(localStorage.getItem("work_reports") || "[]");
        const newLocalRecord = {
          ...apiPayload,
          id: createdId || `act-${Date.now()}`,
          _id: createdId,
          resumeName: resumeFile ? resumeFile.name : null,
          resumeUrl: resumeDataUrl || null,
          resumeDataUrl: resumeDataUrl || null,
        };
        stored.unshift(newLocalRecord);
        localStorage.setItem("work_reports", JSON.stringify(stored.slice(0, 30)));

        if (resumeDataUrl) {
          const fileCache = JSON.parse(localStorage.getItem("uploaded_resumes") || "{}");
          if (resumeFile?.name) fileCache[resumeFile.name] = resumeDataUrl;
          if (createdId) fileCache[String(createdId)] = resumeDataUrl;
          if (cleanPhone) fileCache[cleanPhone] = resumeDataUrl;
          if (formData.candidateName) fileCache[formData.candidateName.trim().toLowerCase()] = resumeDataUrl;
          localStorage.setItem("uploaded_resumes", JSON.stringify(fileCache));
        }
      } catch (cacheErr) {
        console.warn("Could not cache report record:", cacheErr);
      }

      toast.success("Daily Work Report submitted successfully!");
      navigate("/activity");
    } catch (err) {
      const errorMsg = typeof err === "string" ? err : err?.message || "Failed to submit report";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section: Back Button + Title */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate("/activity")}
            className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Daily Work Report
          </h1>
        </div>

        {/* Report Date Section */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Report Date
          </label>
          <div className="relative w-full max-w-sm">
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all shadow-2xs cursor-pointer font-medium"
            />
          </div>
        </div>

        {/* Main Card: Candidate Interaction Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-6">
          <h2 className="text-base font-bold text-[#8931BA] tracking-wide">
            Candidate Interaction
          </h2>

          {/* Row 1: Candidate Name | Email Address | Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Candidate Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.candidateName}
                onChange={(e) => handleInputChange("candidateName", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
                {loadingCategories && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
              </label>
              <CustomDropdown
                required
                value={formData.category}
                placeholder="Select Category"
                options={categoryOptions}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          {/* Row 2: Role (Sub-Category) | Designation | Education */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Role (Sub-Category) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Role (Sub-Category) <span className="text-red-500">*</span>
                {loadingSubcategories && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
              </label>
              <CustomDropdown
                required
                value={formData.role}
                placeholder="Select Role"
                options={subCategoryOptions}
                onChange={handleRoleChange}
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Designation <span className="text-red-500">*</span>
                {loadingDesignations && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
              </label>
              <CustomDropdown
                required
                value={formData.designation}
                placeholder="Select Designation"
                options={designationOptions}
                onChange={(val) => handleInputChange("designation", val)}
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Education <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="eg. BCA, B.Tech"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all"
              />
            </div>
          </div>

          {/* Row 3: Phone Number | Interaction Type | Candidate Status | Resume (PDF) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="00000 00000"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all font-mono"
              />
            </div>

            {/* Interaction Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Interaction Type <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                required
                value={formData.interactionType}
                placeholder="Select Interaction"
                options={INTERACTION_TYPE_OPTIONS}
                onChange={(val) => handleInputChange("interactionType", val)}
              />
            </div>

            {/* Candidate Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Candidate Status <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                required
                value={formData.status}
                placeholder="Select Status"
                options={STATUS_OPTIONS}
                onChange={(val) => handleInputChange("status", val)}
              />
            </div>

            {/* Resume (PDF) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0] || null;
                  setResumeFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const base64 = reader.result;
                      try {
                        const fileCache = JSON.parse(localStorage.getItem("uploaded_resumes") || "{}");
                        fileCache[file.name] = base64;
                        localStorage.setItem("uploaded_resumes", JSON.stringify(fileCache));
                      } catch (err) {
                        console.warn("Could not cache selected file:", err);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-all"
              />
            </div>
          </div>

          {/* Row 4: Key Skills */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Key Skills / Technologies <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React.js, Node.js, JavaScript, Python, SQL, Java"
              value={formData.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all"
            />
          </div>

          {/* Row 5: State | City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                State <span className="text-red-500">*</span>
                {loadingStates && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
              </label>
              <CustomDropdown
                required
                value={formData.state}
                placeholder="Select State"
                options={stateOptions}
                onChange={handleStateChange}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                City <span className="text-red-500">*</span>
                {loadingCities && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
              </label>
              <CustomDropdown
                required
                disabled={!formData.state}
                value={formData.city}
                placeholder={formData.state ? "Select City" : "Choose state first"}
                options={cityOptions}
                onChange={(val) => handleInputChange("city", val)}
              />
            </div>
          </div>

          {/* Row 6: Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Additional Notes
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#8931BA]/20 focus-within:border-[#8931BA] transition-all">
              {/* Toolbar */}
              <div className="bg-gray-50/70 border-b border-gray-200 px-3 py-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`p-1 rounded hover:bg-gray-200/70 transition-colors text-xs font-bold ${
                    isBold ? "bg-gray-200 text-[#8931BA]" : "text-gray-600"
                  }`}
                  title="Bold"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-1 rounded hover:bg-gray-200/70 transition-colors text-xs italic ${
                    isItalic ? "bg-gray-200 text-[#8931BA]" : "text-gray-600"
                  }`}
                  title="Italic"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`p-1 rounded hover:bg-gray-200/70 transition-colors text-xs underline ${
                    isUnderline ? "bg-gray-200 text-[#8931BA]" : "text-gray-600"
                  }`}
                  title="Underline"
                >
                  <Underline size={13} />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Write candidate feedback, discussion highlights or next steps..."
                style={{
                  fontWeight: isBold ? "bold" : "normal",
                  fontStyle: isItalic ? "italic" : "normal",
                  textDecoration: isUnderline ? "underline" : "none",
                }}
                className="w-full p-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Action Buttons: Cancel + Submit */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/activity")}
              className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#8931BA] hover:bg-[#72239f] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? "Submitting..." : "Submit Daily Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkReport;
