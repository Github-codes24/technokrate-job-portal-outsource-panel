import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Bold, Italic, Underline, Save } from "lucide-react";
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
  fetchDailyActivityById,
  updateDailyActivity,
  clearSubcategories,
  clearDesignations,
  clearCities,
} from "../../redux/slice/activity/dailyActivitySlice";

// Fallback Indian states using country-state-city
const INDIAN_STATES_FALLBACK = State.getStatesOfCountry("IN");

const EditWorkReport = () => {
  const { id } = useParams();
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
  const [existingResumeName, setExistingResumeName] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial dropdown categories and states on mount
  useEffect(() => {
    dispatch(fetchDailyActivityCategories());
    dispatch(fetchDailyActivityStates());
  }, [dispatch]);

  // Load existing report data on mount (supports direct API lookup for backend MongoDB records)
  useEffect(() => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const populateForm = (report) => {
      if (!report) return false;

      if (report.date || report.reportDate || report.createdAt) {
        setReportDate(report.date || report.reportDate || report.createdAt.split("T")[0]);
      }

      let matchedStateCode = "";
      if (report.state) {
        const found = INDIAN_STATES_FALLBACK.find(
          (s) =>
            s.name.toLowerCase() === (report.state || "").toLowerCase() ||
            s.isoCode === report.state
        );
        if (found) matchedStateCode = found.isoCode;
        dispatch(fetchDailyActivityCities(report.state));
      }

      setFormData({
        candidateName: report.candidateName || report.name || "",
        email: report.email || "",
        category: report.category || "",
        role: report.role || report.subCategory || "",
        designation: report.designation || "",
        education: report.education || "",
        phoneNumber: report.phoneNumber || report.phone || "",
        interactionType: report.interactionType || "Call",
        status: report.status || "Pending",
        skills: report.skills || "",
        state: report.state || "",
        stateCode: matchedStateCode,
        city: report.city || "",
        notes: report.notes || "",
      });

      if (report.resumeName || report.resumeUrl) {
        setExistingResumeName(report.resumeName || report.resumeUrl);
      }
      return true;
    };

    const loadData = async () => {
      setLoading(true);

      // 1. If it's a backend Mongo ID, fetch from API endpoint: GET /api/outsource/daily-activity/:id
      if (isMongoId) {
        try {
          const apiData = await dispatch(fetchDailyActivityById(id)).unwrap();
          if (apiData && populateForm(apiData)) {
            setLoading(false);
            return;
          }
        } catch {
          // If API fetch fails or network offline, proceed to check localStorage
        }
      }

      // 2. Check localStorage fallback
      let allReports = [];
      try {
        const saved = localStorage.getItem("work_reports");
        if (saved) {
          allReports = JSON.parse(saved);
        }
      } catch {
        allReports = [];
      }

      const report = allReports.find(
        (r) => String(r.id) === String(id) || String(r._id) === String(id)
      );

      if (report && populateForm(report)) {
        setLoading(false);
        return;
      }

      toast.error("Work report not found!");
      navigate("/activity");
      setLoading(false);
    };

    loadData();
  }, [id, navigate, dispatch]);

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

  // Trigger subcategory fetch when category is known/changed
  useEffect(() => {
    if (formData.category) {
      const matchedCategory = categoryObjects.find(
        (c) => c.name === formData.category || c.id === formData.category
      );
      const categoryIdToFetch = matchedCategory?.id;
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(categoryIdToFetch);
      if (categoryIdToFetch && isMongoId) {
        dispatch(fetchDailyActivitySubcategories(categoryIdToFetch));
      }
    }
  }, [formData.category, categoryObjects, dispatch]);

  // Normalized Subcategory Objects: { id, name }
  const subCategoryObjects = useMemo(() => {
    if (Array.isArray(apiSubcategories) && apiSubcategories.length > 0) {
      return apiSubcategories.map((s) => ({
        id: s._id || s.id || s.name || s.subcategoryName,
        name: s.name || s.subcategoryName || s.role || String(s),
      }));
    }
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

  // Trigger designations fetch when role is known/changed
  useEffect(() => {
    if (formData.role) {
      const matchedSubCategory = subCategoryObjects.find(
        (s) => s.name === formData.role || s.id === formData.role
      );
      const subCategoryIdToFetch = matchedSubCategory?.id;
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(subCategoryIdToFetch);
      if (subCategoryIdToFetch && isMongoId) {
        dispatch(fetchDailyActivityDesignations(subCategoryIdToFetch));
      }
    }
  }, [formData.role, subCategoryObjects, dispatch]);

  // Normalized Designation Objects: { id, name }
  const designationObjects = useMemo(() => {
    if (Array.isArray(apiDesignations) && apiDesignations.length > 0) {
      return apiDesignations.map((d) => ({
        id: d._id || d.id || d.name || d.designationName,
        name: d.name || d.designationName || String(d),
      }));
    }
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

    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required!");
      return;
    }

    if (!reportDate) {
      toast.error("Report date is required!");
      return;
    }

    if (!formData.skills.trim()) {
      toast.error("Key skills are required!");
      return;
    }

    // Resolve MongoDB IDs
    const matchedCategory = categoryObjects.find(
      (c) => c.name === formData.category || c.id === formData.category
    );
    const categoryId = matchedCategory?.id || formData.category;

    const matchedSubCategory = subCategoryObjects.find(
      (s) => s.name === formData.role || s.id === formData.role
    );
    const subCategoryId = matchedSubCategory?.id || formData.role;

    const matchedDesignation = designationObjects.find(
      (d) => d.name === formData.designation || d.id === formData.designation
    );
    const designationId = matchedDesignation?.id || formData.designation;

    setIsSubmitting(true);

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

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
      education: formData.education || "",
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
      resumeName: resumeFile ? resumeFile.name : existingResumeName || null,
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

    if (isMongoId) {
      try {
        const resumeDataUrl = await readResumeBase64();
        await dispatch(updateDailyActivity({ id, data: apiPayload })).unwrap();
        
        // Update local work_reports cache with resumeName and resumeDataUrl
        try {
          const stored = JSON.parse(localStorage.getItem("work_reports") || "[]");
          const updated = stored.map((item) =>
            String(item.id) === String(id) || String(item._id) === String(id)
              ? {
                  ...item,
                  ...apiPayload,
                  resumeName: resumeFile ? resumeFile.name : existingResumeName,
                  resumeUrl: resumeDataUrl || item.resumeUrl || null,
                  resumeDataUrl: resumeDataUrl || item.resumeDataUrl || null,
                }
              : item
          );
          localStorage.setItem("work_reports", JSON.stringify(updated));
        } catch {
          // Ignore
        }

        toast.success("Work report updated successfully!");
        navigate("/activity");
        return;
      } catch (err) {
        const errorMsg = typeof err === "string" ? err : err?.message || "Failed to update report";
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    // Local storage fallback
    try {
      let stored = [];
      const saved = localStorage.getItem("work_reports");
      if (saved) {
        stored = JSON.parse(saved);
      } else {
        stored = [];
      }

      const updatedList = stored.map((item) => {
        if (String(item.id) === String(id) || String(item._id) === String(id)) {
          return {
            ...item,
            ...formData,
            name: formData.candidateName,
            role: formData.role,
            subCategory: formData.role,
            position: `${formData.role} - ${formData.designation}`,
            date: reportDate,
            resumeName: resumeFile ? resumeFile.name : existingResumeName,
          };
        }
        return item;
      });

      localStorage.setItem("work_reports", JSON.stringify(updatedList));
      toast.success("Work report updated successfully!");
      navigate("/activity");
    } catch {
      toast.error("Failed to update work report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        Loading report details...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/activity")}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Daily Activity"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Daily Work Report</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update candidate submission details and daily updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="reportDate" className="text-xs font-semibold text-slate-600">
            Report Date:
          </label>
          <input
            type="date"
            id="reportDate"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Main Form Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Candidate & Category Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">
              Candidate Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Candidate Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Candidate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.candidateName}
                  onChange={(e) => handleInputChange("candidateName", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                />
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="candidate@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Education / Degree
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech (Computer Science)"
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category
                  {loadingCategories && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
                </label>
                <CustomDropdown
                  value={formData.category}
                  placeholder="Select Category"
                  options={categoryOptions}
                  onChange={handleCategoryChange}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Role
                  {loadingSubcategories && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
                </label>
                <CustomDropdown
                  value={formData.role}
                  placeholder="Select Role"
                  options={subCategoryOptions}
                  onChange={handleRoleChange}
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Designation
                  {loadingDesignations && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
                </label>
                <CustomDropdown
                  value={formData.designation}
                  placeholder="Select Designation"
                  options={designationOptions}
                  onChange={(val) => handleInputChange("designation", val)}
                />
              </div>

              {/* Interaction Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Interaction Type
                </label>
                <CustomDropdown
                  value={formData.interactionType}
                  placeholder="Select Interaction"
                  options={INTERACTION_TYPE_OPTIONS}
                  onChange={(val) => handleInputChange("interactionType", val)}
                />
              </div>

              {/* Application Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <CustomDropdown
                  value={formData.status}
                  placeholder="Select Status"
                  options={STATUS_OPTIONS}
                  onChange={(val) => handleInputChange("status", val)}
                />
              </div>

              {/* Skills */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Key Skills / Technologies
                </label>
                <input
                  type="text"
                  placeholder="e.g. React.js, Node.js, MongoDB, Tailwind CSS, TypeScript"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] text-slate-700"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separate multiple skills with commas (e.g., React, Java, Docker)
                </p>
              </div>
            </div>
          </div>

          {/* Section: Location Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 border-b pb-2 mb-4 uppercase tracking-wider">
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State
                  {loadingStates && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
                </label>
                <CustomDropdown
                  value={formData.state}
                  placeholder="Select State"
                  options={stateOptions}
                  onChange={handleStateChange}
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City
                  {loadingCities && <span className="text-[10px] text-gray-400 ml-1 font-normal">(Loading...)</span>}
                </label>
                <CustomDropdown
                  disabled={!formData.state}
                  value={formData.city}
                  placeholder={formData.state ? "Select City" : "Choose state first"}
                  options={cityOptions}
                  onChange={(val) => handleInputChange("city", val)}
                />
              </div>
            </div>
          </div>

          {/* Section: Resume Attachment */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 border-b pb-2 mb-4 uppercase tracking-wider">
              Resume / CV
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0] || null)}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {resumeFile ? (
                <span className="text-xs text-emerald-600 font-medium">
                  New file: {resumeFile.name}
                </span>
              ) : existingResumeName ? (
                <span className="text-xs text-slate-500">
                  Current file: <span className="font-semibold text-slate-700">{existingResumeName}</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Section: Notes & Summary (with Rich Text controls) */}
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Work Summary & Notes
              </h2>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBold((prev) => !prev)}
                  className={`p-1.5 rounded transition-colors ${
                    isBold ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsItalic((prev) => !prev)}
                  className={`p-1.5 rounded transition-colors ${
                    isItalic ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnderline((prev) => !prev)}
                  className={`p-1.5 rounded transition-colors ${
                    isUnderline ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  }`}
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              placeholder="Enter notes, interviewer feedback, or next action items..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className={`w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 resize-y ${
                isBold ? "font-bold" : ""
              } ${isItalic ? "italic" : ""} ${isUnderline ? "underline" : ""}`}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#8931BA] hover:bg-[#72239f] rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkReport;
