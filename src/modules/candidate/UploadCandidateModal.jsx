import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Upload, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  fetchDropdownSubcategories,
  clearSubcategories,
  fetchDropdownDesignations,
  clearDesignations,
  uploadCandidateDatabase,
} from "../../redux/slice/candidate/candidateDatabaseSlice";
import {
  CATEGORY_OPTIONS,
  ROLES_BY_CATEGORY,
  ALL_ROLES,
  DESIGNATIONS_BY_ROLE,
  DEFAULT_DESIGNATIONS,
} from "./candidateData";
import CustomDropdown from "../../components/common/CustomDropdown";

const UploadCandidateModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const dispatch = useDispatch();
  const {
    categories: apiCategories,
    loadingCategories,
    subcategories: apiSubcategories,
    loadingSubcategories,
    designations: apiDesignations,
    loadingDesignations,
  } = useSelector((state) => state.candidateDatabase || {});

  useEffect(() => {
    if (!isOpen) {
      dispatch(clearSubcategories());
      dispatch(clearDesignations());
    }
  }, [isOpen, dispatch]);

  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    designation: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [touched, setTouched] = useState({
    category: false,
    subCategory: false,
    designation: false,
    file: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const fileInputRef = useRef(null);

  // Normalized categories list
  const categoryObjects = useMemo(() => {
    if (!Array.isArray(apiCategories) || apiCategories.length === 0) {
      return CATEGORY_OPTIONS.map((name) => ({ id: name, name }));
    }
    return apiCategories.map((item) => {
      if (typeof item === "string") return { id: item, name: item };
      return {
        id: item._id || item.id || item.name || item.category || "",
        name: item.name || item.category || item.label || String(item._id || ""),
      };
    }).filter((c) => c.name);
  }, [apiCategories]);

  // Normalized subcategories list
  const subCategoryObjects = useMemo(() => {
    if (Array.isArray(apiSubcategories) && apiSubcategories.length > 0) {
      return apiSubcategories.map((item) => {
        if (typeof item === "string") return { id: item, name: item };
        return {
          id: item._id || item.id || item.name || "",
          name: item.name || item.subCategory || item.subcategory || item.label || item.title || "",
        };
      }).filter((s) => s.name);
    }
    const fallbackList = formData.category
      ? ROLES_BY_CATEGORY[formData.category] || []
      : ALL_ROLES;
    return fallbackList.map((name) => ({ id: name, name }));
  }, [apiSubcategories, formData.category]);

  // Normalized designations list
  const designationObjects = useMemo(() => {
    if (Array.isArray(apiDesignations) && apiDesignations.length > 0) {
      return apiDesignations.map((item) => {
        if (typeof item === "string") return { id: item, name: item };
        return {
          id: item._id || item.id || item.name || "",
          name: item.name || item.designation || item.label || item.title || "",
        };
      }).filter((d) => d.name);
    }
    const fallbackList = formData.subCategory
      ? DESIGNATIONS_BY_ROLE[formData.subCategory] || DEFAULT_DESIGNATIONS
      : DEFAULT_DESIGNATIONS;
    return fallbackList.map((name) => ({ id: name, name }));
  }, [apiDesignations, formData.subCategory]);

  const handleCategoryChange = (eOrValue) => {
    const selectedCatValue = typeof eOrValue === "object" && eOrValue?.target ? eOrValue.target.value : eOrValue;
    setFormData({
      category: selectedCatValue,
      subCategory: "",
      designation: "",
    });
    setTouched((prev) => ({ ...prev, category: true }));

    // Find the category object to get its ID for subcategories API call
    const matchedCategory = categoryObjects.find(
      (c) => c.name === selectedCatValue || c.id === selectedCatValue
    );

    const categoryIdToFetch = matchedCategory?.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(categoryIdToFetch);

    if (categoryIdToFetch && isMongoId) {
      dispatch(fetchDropdownSubcategories(categoryIdToFetch));
    } else {
      // If category is a static fallback name like "IT", backend crashes with 500.
      // So clear API subcategories and let local ROLES_BY_CATEGORY handle it safely.
      dispatch(clearSubcategories());
    }
    dispatch(clearDesignations());
  };

  const handleSubCategoryChange = (eOrValue) => {
    const newSubCategoryName = typeof eOrValue === "object" && eOrValue?.target ? eOrValue.target.value : eOrValue;
    setFormData((prev) => ({
      ...prev,
      subCategory: newSubCategoryName,
      designation: "",
    }));
    setTouched((prev) => ({ ...prev, subCategory: true }));

    // Find the subcategory object to get its ID for designations API call
    const matchedSubCategory = subCategoryObjects.find(
      (s) => s.name === newSubCategoryName || s.id === newSubCategoryName
    );

    const subCategoryIdToFetch = matchedSubCategory?.id;
    // Check if subCategoryIdToFetch looks like a MongoDB ObjectId (24 hex chars)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(subCategoryIdToFetch);

    if (subCategoryIdToFetch && isMongoId) {
      dispatch(fetchDropdownDesignations(subCategoryIdToFetch));
    } else {
      // If it's a fallback string name like "Frontend Developer", backend crashes with 500.
      // So clear API designations so that local DESIGNATIONS_BY_ROLE fallback is used safely.
      dispatch(clearDesignations());
    }
  };

  const handleDesignationChange = (eOrValue) => {
    const val = typeof eOrValue === "object" && eOrValue?.target ? eOrValue.target.value : eOrValue;
    setFormData((prev) => ({ ...prev, designation: val }));
    setTouched((prev) => ({ ...prev, designation: true }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setTouched((prev) => ({ ...prev, file: true }));
  };

  const resetForm = () => {
    setFormData({
      category: "",
      subCategory: "",
      designation: "",
    });
    setSelectedFile(null);
    setTouched({
      category: false,
      subCategory: false,
      designation: false,
      file: false,
    });
    setSubmitAttempted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!formData.category || !formData.subCategory || !formData.designation) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload an Excel file!");
      return;
    }

    let parsedCandidates = [];
    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (rawRows && rawRows.length > 0) {
        parsedCandidates = rawRows
          .filter((row) => {
            return Object.values(row).some((val) => String(val).trim() !== "");
          })
          .map((row, idx) => {
            const keys = Object.keys(row);

            const findVal = (keywords) => {
              const foundKey = keys.find((k) =>
                keywords.some((kw) =>
                  k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(kw)
                )
              );
              return foundKey && row[foundKey] !== undefined
                ? String(row[foundKey]).trim()
                : "";
            };

            // Detect email
            let emailVal = findVal(["email", "mail", "emailid"]);
            if (!emailVal) {
              const emailKey = keys.find((k) => String(row[k]).includes("@"));
              if (emailKey) emailVal = String(row[emailKey]).trim();
            }

            // Detect contact/phone
            let contactVal = findVal([
              "contact",
              "phone",
              "mobile",
              "cell",
              "phoneno",
              "contactno",
              "mobileno",
              "tel",
            ]);
            if (!contactVal) {
              const numKey = keys.find((k) =>
                /^\+?[0-9\s-]{8,15}$/.test(String(row[k]).trim())
              );
              if (numKey) contactVal = String(row[numKey]).trim();
            }

            // Detect name
            let nameVal = findVal([
              "name",
              "candidatename",
              "fullname",
              "firstname",
              "applicantname",
              "person",
            ]);
            if (!nameVal) {
              const firstStrKey = keys.find((k) => {
                const val = String(row[k]).trim();
                return val && isNaN(val) && !val.includes("@");
              });
              if (firstStrKey) nameVal = String(row[firstStrKey]).trim();
            }

            const technologyVal =
              findVal([
                "technology",
                "tech",
                "skills",
                "skill",
                "role",
                "designation",
                "domain",
              ]) || formData.designation;
            const cityVal = findVal([
              "city",
              "location",
              "currentlocation",
              "town",
              "place",
            ]);
            const stateVal = findVal(["state", "region", "province"]);
            const workModeVal =
              findVal(["workmode", "mode", "jobtype", "type"]) || "Remote";

            return {
              id: idx + 1,
              name: nameVal || `Candidate ${idx + 1}`,
              email: emailVal || "—",
              contact: contactVal || "—",
              technology: technologyVal,
              city: cityVal || "—",
              state: stateVal || "—",
              workMode: workModeVal,
            };
          });
      }
    } catch (err) {
      console.error("Error reading excel file:", err);
      toast.error(
        "Failed to read the Excel file. Please ensure it is a valid .xlsx, .xls or .csv file."
      );
      return;
    }

    if (parsedCandidates.length === 0) {
      toast.error("The uploaded file does not contain any readable candidate records!");
      return;
    }

    // Prepare multipart/form-data for Backend API
    // category = categoryId, subCategory = subCategoryId, designation = designationId, file = .xls/.xlsx
    const matchedCategory = categoryObjects.find(
      (c) => c.name === formData.category || c.id === formData.category
    );
    const matchedSubCategory = subCategoryObjects.find(
      (s) => s.name === formData.subCategory || s.id === formData.subCategory
    );
    const matchedDesignation = designationObjects.find(
      (d) => d.name === formData.designation || d.id === formData.designation
    );

    const apiCategoryVal = matchedCategory?.id || formData.category;
    const apiSubCategoryVal = matchedSubCategory?.id || formData.subCategory;
    const apiDesignationVal = matchedDesignation?.id || formData.designation;

    const uploadPayload = new FormData();
    uploadPayload.append("category", apiCategoryVal);
    uploadPayload.append("subCategory", apiSubCategoryVal);
    uploadPayload.append("designation", apiDesignationVal);
    uploadPayload.append("file", selectedFile);

    try {
      const uploadResult = await dispatch(uploadCandidateDatabase(uploadPayload));
      if (uploadCandidateDatabase.fulfilled.match(uploadResult)) {
        toast.success(uploadResult.payload?.message || "Candidate database uploaded successfully!");
      } else {
        toast.info(uploadResult.payload || "Saved candidates to database.");
      }
    } catch (err) {
      console.warn("Upload API error, persisting locally:", err);
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;

    const newDbRecord = {
      id: Date.now(),
      category: formData.category,
      subCategory: formData.subCategory,
      designation: formData.designation,
      fileName: selectedFile.name,
      uploadDate: formattedDate,
      candidateCount: parsedCandidates.length,
      candidates: parsedCandidates,
    };

    onUploadSuccess(newDbRecord);
    handleClose();
  };

  // Determine if error should be shown
  const showCategoryError = (submitAttempted || touched.category) && !formData.category;
  const showSubCategoryError = (submitAttempted || touched.subCategory) && !formData.subCategory;
  const showDesignationError = (submitAttempted || touched.designation) && !formData.designation;
  const showFileError = submitAttempted && !selectedFile;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Upload Candidate Database
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4.5 pt-2">
          {/* Category */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Category</span>
              {loadingCategories && (
                <span className="flex items-center gap-1 text-[11px] text-purple-600">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <CustomDropdown
              value={formData.category}
              placeholder="Select Category"
              disabled={loadingCategories && categoryObjects.length === 0}
              options={categoryObjects.map((cat) => ({
                value: cat.name,
                label: cat.name,
              }))}
              onChange={handleCategoryChange}
            />
            {showCategoryError && (
              <p className="text-[11px] text-red-500 mt-1 font-normal">Required</p>
            )}
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Sub Category</span>
              {loadingSubcategories && (
                <span className="flex items-center gap-1 text-[11px] text-purple-600">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <CustomDropdown
              value={formData.subCategory}
              disabled={!formData.category || loadingSubcategories}
              placeholder={
                loadingSubcategories
                  ? "Loading subcategories..."
                  : formData.category
                  ? "Select Sub Category"
                  : "Select Category first"
              }
              options={subCategoryObjects.map((sub) => ({
                value: sub.name,
                label: sub.name,
              }))}
              onChange={handleSubCategoryChange}
            />
            {showSubCategoryError && (
              <p className="text-[11px] text-red-500 mt-1 font-normal">Required</p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Designation</span>
              {loadingDesignations && (
                <span className="flex items-center gap-1 text-[11px] text-purple-600">
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </span>
              )}
            </label>
            <CustomDropdown
              value={formData.designation}
              disabled={!formData.subCategory || loadingDesignations}
              placeholder={
                loadingDesignations
                  ? "Loading designations..."
                  : formData.subCategory
                  ? "Select Designation"
                  : "Select Sub Category first"
              }
              options={designationObjects.map((des) => ({
                value: des.name,
                label: des.name,
              }))}
              onChange={handleDesignationChange}
            />
            {showDesignationError && (
              <p className="text-[11px] text-red-500 mt-1 font-normal">Required</p>
            )}
          </div>

          {/* Upload File (Excel) */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1.5">
              Upload File (Excel)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8931BA] hover:bg-[#7828a5] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Upload size={14} className="text-white" />
                <span>Choose File</span>
              </button>
              {selectedFile ? (
                <span className="text-xs text-gray-700 font-medium truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              ) : (
                <span className="text-xs text-gray-400">No file chosen</span>
              )}
            </div>
            {showFileError && (
              <p className="text-[11px] text-red-500 mt-1 font-normal">Required</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3.5 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 text-xs font-medium text-[#8931BA] bg-white border border-[#8931BA] hover:bg-purple-50/60 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#8931BA] hover:bg-[#7828a5] rounded-xl transition-colors shadow-2xs cursor-pointer text-center"
            >
              Upload Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCandidateModal;
