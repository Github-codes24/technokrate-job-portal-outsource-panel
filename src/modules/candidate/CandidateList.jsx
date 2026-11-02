import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ConfirmModal from "../../components/common/ConfirmModal";
import UploadCandidateModal from "./UploadCandidateModal";
import CandidateDatabaseDetails from "./CandidateDatabaseDetails";
import CustomDropdown from "../../components/common/CustomDropdown";
import {
  fetchDropdownCategories,
  fetchDropdownSubcategories,
  clearSubcategories,
  fetchDropdownDesignations,
  clearDesignations,
  fetchCandidateDatabases,
  fetchCandidateDatabaseById,
  updateCandidateDatabase,
  deleteCandidateDatabase,
  downloadCandidateDatabase,
} from "../../redux/slice/candidate/candidateDatabaseSlice";
import {
  INITIAL_CANDIDATE_DATABASES,
  CATEGORY_OPTIONS,
  ROLES_BY_CATEGORY,
  ALL_ROLES,
  DESIGNATIONS_BY_ROLE,
  DEFAULT_DESIGNATIONS,
  generateMockCandidates,
} from "./candidateData";

const CandidateList = () => {
  const dispatch = useDispatch();
  const {
    categories: apiCategories,
    loadingCategories,
    subcategories: apiSubcategories,
    loadingSubcategories,
    designations: apiDesignations,
    loadingDesignations,
    databases: apiDatabases,
    pagination: apiPagination,
    loadingDatabases,
    hasFetchedDatabases,
  } = useSelector((state) => state.candidateDatabase || {});

  // Fetch categories for mapping names to valid MongoDB IDs
  useEffect(() => {
    dispatch(fetchDropdownCategories());
  }, [dispatch]);

  // Normalized category objects
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

  const [databases, setDatabases] = useState(() => {
    try {
      const saved = localStorage.getItem("candidate_databases");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch own records from backend API
  useEffect(() => {
    dispatch(
      fetchCandidateDatabases({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery.trim(),
      })
    );
  }, [dispatch, currentPage, searchQuery]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // When editItem opens or changes category, fetch subcategories
  useEffect(() => {
    if (editItem?.categoryId || editItem?.category) {
      const matched = categoryObjects.find(
        (c) => c.id === editItem.categoryId || c.name === editItem.category
      );
      const catId =
        (matched?.id && /^[0-9a-fA-F]{24}$/.test(matched.id) && matched.id) ||
        (editItem.categoryId && /^[0-9a-fA-F]{24}$/.test(editItem.categoryId) && editItem.categoryId) ||
        (editItem.rawCategory?._id && /^[0-9a-fA-F]{24}$/.test(editItem.rawCategory._id) && editItem.rawCategory._id);

      if (catId) {
        dispatch(fetchDropdownSubcategories(catId));
      }
    }
  }, [editItem?.id, editItem?.categoryId, editItem?.category, categoryObjects, dispatch]);

  const editSubCategoryOptions = useMemo(() => {
    if (Array.isArray(apiSubcategories) && apiSubcategories.length > 0) {
      return apiSubcategories.map((item) => {
        if (typeof item === "string") return { id: item, name: item };
        return {
          id: item._id || item.id || item.name || "",
          name: item.name || item.subCategory || item.subcategory || item.label || item.title || "",
        };
      }).filter((s) => s.name);
    }
    const fallbackList = editItem?.category
      ? ROLES_BY_CATEGORY[editItem.category] || []
      : ALL_ROLES;
    return fallbackList.map((name) => ({ id: name, name }));
  }, [apiSubcategories, editItem?.category]);

  // When editItem opens or changes subcategory, fetch designations
  useEffect(() => {
    if (editItem?.subCategoryId || editItem?.subCategory) {
      const matched = editSubCategoryOptions.find(
        (s) => s.id === editItem.subCategoryId || s.name === editItem.subCategory
      );
      const subCatId =
        (matched?.id && /^[0-9a-fA-F]{24}$/.test(matched.id) && matched.id) ||
        (editItem.subCategoryId && /^[0-9a-fA-F]{24}$/.test(editItem.subCategoryId) && editItem.subCategoryId) ||
        (editItem.rawSubCategory?._id && /^[0-9a-fA-F]{24}$/.test(editItem.rawSubCategory._id) && editItem.rawSubCategory._id);

      if (subCatId) {
        dispatch(fetchDropdownDesignations(subCatId));
      }
    }
  }, [editItem?.id, editItem?.subCategoryId, editItem?.subCategory, editSubCategoryOptions, dispatch]);

  const editDesignationOptions = useMemo(() => {
    if (Array.isArray(apiDesignations) && apiDesignations.length > 0) {
      return apiDesignations.map((item) => {
        if (typeof item === "string") return { id: item, name: item };
        return {
          id: item._id || item.id || item.name || "",
          name: item.name || item.designation || item.label || item.title || "",
        };
      }).filter((d) => d.name);
    }
    const fallbackList = editItem?.subCategory
      ? DESIGNATIONS_BY_ROLE[editItem.subCategory] || DEFAULT_DESIGNATIONS
      : DEFAULT_DESIGNATIONS;
    return fallbackList.map((name) => ({ id: name, name }));
  }, [apiDesignations, editItem?.subCategory]);

  // Display databases: use API records if available or after fetch
  const displayList = useMemo(() => {
    if (Array.isArray(apiDatabases) && (apiDatabases.length > 0 || hasFetchedDatabases)) {
      return apiDatabases.map((item, idx) => ({
        id: item._id || item.id || idx + 1,
        _id: item._id || item.id,
        rawCategory: item.category,
        rawSubCategory: item.subCategory,
        rawDesignation: item.designation,
        category:
          typeof item.category === "object"
            ? item.category?.name || item.category?.category || "—"
            : item.category || "—",
        subCategory:
          typeof item.subCategory === "object"
            ? item.subCategory?.name || item.subCategory?.subCategory || "—"
            : item.subCategory || "—",
        designation:
          typeof item.designation === "object"
            ? item.designation?.name || item.designation?.designation || "—"
            : item.designation || "—",
        fileName: item.fileName || item.file?.name || item.originalName || "candidates.xlsx",
        fileUrl: item.fileUrl || item.file?.url || item.url || "",
        uploadDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : (item.uploadDate || "—"),
        candidateCount: item.candidateCount || item.candidates?.length || 20,
        candidates: item.candidates || [],
      }));
    }
    return databases.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        item.category.toLowerCase().includes(query) ||
        item.subCategory.toLowerCase().includes(query) ||
        item.designation.toLowerCase().includes(query) ||
        (item.fileName && item.fileName.toLowerCase().includes(query))
      );
    });
  }, [apiDatabases, databases, hasFetchedDatabases, searchQuery]);

  const totalRecordsCount =
    apiDatabases && apiDatabases.length > 0
      ? apiPagination.totalRecords || apiDatabases.length
      : displayList.length;

  const totalPages =
    apiDatabases && apiDatabases.length > 0
      ? apiPagination.totalPages || Math.ceil(totalRecordsCount / itemsPerPage) || 1
      : Math.ceil(displayList.length / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems =
    apiDatabases && apiDatabases.length > 0
      ? displayList
      : displayList.slice(startIndex, startIndex + itemsPerPage);

  // Save changes to localStorage
  const saveToStorage = (updatedList) => {
    setDatabases(updatedList);
    try {
      localStorage.setItem("candidate_databases", JSON.stringify(updatedList));
    } catch {}
  };

  // Handle Download Excel File (API 9 / fallback)
  const handleDownload = async (item) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(item._id || item.id);
    if (isMongoId) {
      try {
        const downloadAction = await dispatch(
          downloadCandidateDatabase({
            id: item._id || item.id,
            fileName: item.fileName || `${item.designation || "Candidates"}.xlsx`,
          })
        );
        if (downloadCandidateDatabase.fulfilled.match(downloadAction)) {
          toast.success(`Downloaded ${item.fileName || "Candidates"}`);
          return;
        }
      } catch (err) {
        console.warn("Download API failed, falling back to local exporter:", err);
      }
    }

    // Local exporter fallback
    try {
      const candidatesList =
        item.candidates && item.candidates.length > 0
          ? item.candidates
          : generateMockCandidates(item.designation, item.candidateCount || 20);

      const dataToExport = candidatesList.map((c, idx) => ({
        "Sr. No": idx + 1,
        Name: c.name,
        Email: c.email,
        Contact: c.contact,
        Technology: c.technology || item.designation,
        City: c.city,
        State: c.state,
        "Work Mode": c.workMode || "Remote",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

      const fileName = item.fileName?.endsWith(".xlsx")
        ? item.fileName
        : `${(item.fileName || item.designation || "Candidates").replace(/\.[^/.]+$/, "")}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      toast.success(`Downloaded ${fileName}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download file");
    }
  };

  // Handle Upload Success from Modal
  const handleUploadSuccess = (newDb) => {
    const updated = [newDb, ...databases];
    saveToStorage(updated);
    dispatch(
      fetchCandidateDatabases({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery.trim(),
      })
    );
  };

  // Handle Edit Submission (API 7)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem) return;

    const recordId = editItem._id || editItem.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(recordId);

    if (isMongoId) {
      // Find category MongoDB ObjectId
      const matchedCategory = categoryObjects.find(
        (c) => c.name === editItem.category || c.id === editItem.category
      );
      const catId =
        (matchedCategory?.id && /^[0-9a-fA-F]{24}$/.test(matchedCategory.id) && matchedCategory.id) ||
        (editItem.categoryId && /^[0-9a-fA-F]{24}$/.test(editItem.categoryId) && editItem.categoryId) ||
        (editItem.rawCategory?._id && /^[0-9a-fA-F]{24}$/.test(editItem.rawCategory._id) && editItem.rawCategory._id) ||
        (typeof editItem.rawCategory === "string" && /^[0-9a-fA-F]{24}$/.test(editItem.rawCategory) && editItem.rawCategory) ||
        null;

      // Find subcategory MongoDB ObjectId
      const matchedSubCategory = editSubCategoryOptions.find(
        (s) => s.name === editItem.subCategory || s.id === editItem.subCategory
      );
      const subCatId =
        (matchedSubCategory?.id && /^[0-9a-fA-F]{24}$/.test(matchedSubCategory.id) && matchedSubCategory.id) ||
        (editItem.subCategoryId && /^[0-9a-fA-F]{24}$/.test(editItem.subCategoryId) && editItem.subCategoryId) ||
        (editItem.rawSubCategory?._id && /^[0-9a-fA-F]{24}$/.test(editItem.rawSubCategory._id) && editItem.rawSubCategory._id) ||
        (typeof editItem.rawSubCategory === "string" && /^[0-9a-fA-F]{24}$/.test(editItem.rawSubCategory) && editItem.rawSubCategory) ||
        null;

      // Find designation MongoDB ObjectId if available
      const matchedDesignation = editDesignationOptions.find(
        (d) => d.name === editItem.designation || d.id === editItem.designation
      );
      const desId =
        (matchedDesignation?.id && /^[0-9a-fA-F]{24}$/.test(matchedDesignation.id) && matchedDesignation.id) ||
        (editItem.designationId && /^[0-9a-fA-F]{24}$/.test(editItem.designationId) && editItem.designationId) ||
        (editItem.rawDesignation?._id && /^[0-9a-fA-F]{24}$/.test(editItem.rawDesignation._id) && editItem.rawDesignation._id) ||
        editItem.designation ||
        null;

      const editFormData = new FormData();
      if (catId) {
        editFormData.append("category", catId);
      }
      if (subCatId) {
        editFormData.append("subCategory", subCatId);
      }
      if (desId) {
        editFormData.append("designation", desId);
      }
      if (editItem.file) {
        editFormData.append("file", editItem.file);
      }

      try {
        const updateRes = await dispatch(
          updateCandidateDatabase({ id: recordId, formData: editFormData })
        );
        if (updateCandidateDatabase.fulfilled.match(updateRes)) {
          toast.success(updateRes.payload?.message || "Database record updated successfully!");
          dispatch(
            fetchCandidateDatabases({
              page: currentPage,
              limit: itemsPerPage,
              search: searchQuery.trim(),
            })
          );
          setEditItem(null);
          return;
        } else {
          toast.error(updateRes.payload || "Failed to update record on server.");
        }
      } catch (err) {
        console.warn("Update API error, updating locally:", err);
      }
    }

    const updated = databases.map((d) => ((d._id || d.id) === recordId ? editItem : d));
    saveToStorage(updated);
    toast.success("Database record updated successfully!");
    setEditItem(null);
  };

  // Handle Delete Confirmation (API 8)
  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(deleteId);
    if (isMongoId) {
      try {
        const delRes = await dispatch(deleteCandidateDatabase(deleteId));
        if (deleteCandidateDatabase.fulfilled.match(delRes)) {
          toast.success(delRes.payload?.response?.message || "Database record deleted successfully!");
          dispatch(
            fetchCandidateDatabases({
              page: currentPage,
              limit: itemsPerPage,
              search: searchQuery.trim(),
            })
          );
          setDeleteId(null);
          return;
        }
      } catch (err) {
        console.warn("Delete API error, deleting locally:", err);
      }
    }

    const updated = databases.filter((d) => (d._id || d.id) !== deleteId);
    saveToStorage(updated);
    toast.success("Database record deleted successfully!");
    setDeleteId(null);
  };

  // Handle View Item (API 6)
  const handleView = async (item) => {
    const recordId = item._id || item.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(recordId);

    if (isMongoId) {
      try {
        const res = await dispatch(fetchCandidateDatabaseById(recordId));
        if (fetchCandidateDatabaseById.fulfilled.match(res) && res.payload) {
          const detail = res.payload?.data || res.payload;
          const extractedCandidates =
            detail?.candidates ||
            detail?.candidateList ||
            detail?.records ||
            detail?.data ||
            item.candidates ||
            [];
          setViewItem({
            ...item,
            ...detail,
            candidates: extractedCandidates,
          });
          return;
        }
      } catch (err) {
        console.warn("View API error, displaying local copy:", err);
      }
    }
    setViewItem(item);
  };

  // If a database is selected to view, show the full CandidateDatabaseDetails screen
  if (viewItem) {
    const enrichedViewItem = {
      ...viewItem,
      candidates:
        viewItem.candidates !== undefined
          ? viewItem.candidates
          : generateMockCandidates(viewItem.designation, viewItem.candidateCount || 20),
    };

    return (
      <CandidateDatabaseDetails
        database={enrichedViewItem}
        onBack={() => setViewItem(null)}
        onDownload={handleDownload}
        onUpdateDatabase={(updatedDb) => {
          const updated = databases.map((d) =>
            d.id === updatedDb.id ? updatedDb : d
          );
          saveToStorage(updated);
          setViewItem(updatedDb);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFD] p-4 md:p-8 font-sans">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Candidate Database
        </h1>
      </div>

      {/* Filter & Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search candidates by category, sub-category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all"
          />
        </div>

        {/* Upload Database Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#8931BA] hover:bg-[#7828a5] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload size={15} />
            <span>Upload Database</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/40">
                <th className="py-3.5 px-5 whitespace-nowrap">Sr. No</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Category</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Sub Category</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Designation</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Excel File</th>
                <th className="py-3.5 px-5 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 bg-white">
              {loadingDatabases && currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500">Loading candidate databases...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 font-medium">
                    No candidate database found matching your search.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-purple-50/30 transition-colors border-b border-gray-100"
                  >
                    {/* Sr. No */}
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {startIndex + index + 1}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5 font-bold text-gray-800 tracking-wide">
                      {item.category}
                    </td>

                    {/* Sub Category */}
                    <td className="py-4 px-5 text-gray-700 font-medium">
                      {item.subCategory}
                    </td>

                    {/* Designation */}
                    <td className="py-4 px-5 text-gray-700">
                      {item.designation}
                    </td>

                    {/* Excel File Download Button */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDownload(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 bg-emerald-50/40 hover:bg-emerald-100/60 font-medium text-xs transition-colors cursor-pointer"
                        title={`Download ${item.fileName || "Excel file"}`}
                      >
                        <FileSpreadsheet size={14} className="text-emerald-600" />
                        <span>Download</span>
                        <Download size={13} className="text-emerald-600 ml-0.5" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => handleView(item)}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="View Database Info"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            const rawCatId =
                              item.rawCategory?._id ||
                              (typeof item.rawCategory === "string" && /^[0-9a-fA-F]{24}$/.test(item.rawCategory) ? item.rawCategory : null) ||
                              categoryObjects.find((c) => c.name === item.category)?.id ||
                              null;

                            const rawSubId =
                              item.rawSubCategory?._id ||
                              (typeof item.rawSubCategory === "string" && /^[0-9a-fA-F]{24}$/.test(item.rawSubCategory) ? item.rawSubCategory : null) ||
                              null;

                            const rawDesId =
                              item.rawDesignation?._id ||
                              (typeof item.rawDesignation === "string" && /^[0-9a-fA-F]{24}$/.test(item.rawDesignation) ? item.rawDesignation : null) ||
                              null;

                            setEditItem({
                              ...item,
                              categoryId: rawCatId,
                              subCategoryId: rawSubId,
                              designationId: rawDesId,
                            });
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Database"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-1 text-xs text-gray-600">
        <div>
          {totalRecordsCount > 0 ? (
            <>
              Showing <span className="font-semibold text-purple-700">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-purple-700">
                {Math.min(startIndex + itemsPerPage, totalRecordsCount)}
              </span>{" "}
              of <span className="font-semibold text-purple-700">{totalRecordsCount}</span> Databases
            </>
          ) : (
            <span>Showing 0 Databases</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-8 h-8 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                currentPage === num
                  ? "bg-[#8931BA] text-white shadow-2xs"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal 1: Upload Database Modal */}
      <UploadCandidateModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Modal 2: Edit Database Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-base font-bold text-gray-900 mb-4">Edit Database Details</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Category</span>
                  {loadingCategories && (
                    <span className="text-[11px] text-purple-600">Loading...</span>
                  )}
                </label>
                <CustomDropdown
                  value={editItem.categoryId || editItem.category}
                  placeholder="Select Category"
                  options={categoryObjects.map((cat) => ({
                    value: cat.id || cat.name,
                    label: cat.name,
                  }))}
                  onChange={(selectedVal) => {
                    const matched = categoryObjects.find(
                      (c) => c.id === selectedVal || c.name === selectedVal
                    );
                    const catId = matched?.id || selectedVal;
                    const catName = matched?.name || selectedVal;
                    setEditItem({
                      ...editItem,
                      categoryId: catId,
                      category: catName,
                      subCategoryId: "",
                      subCategory: "",
                      designationId: "",
                      designation: "",
                    });
                    const isMongoId = /^[0-9a-fA-F]{24}$/.test(catId);
                    if (catId && isMongoId) {
                      dispatch(fetchDropdownSubcategories(catId));
                    } else {
                      dispatch(clearSubcategories());
                    }
                    dispatch(clearDesignations());
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Sub Category</span>
                  {loadingSubcategories && (
                    <span className="text-[11px] text-purple-600">Loading...</span>
                  )}
                </label>
                <CustomDropdown
                  value={editItem.subCategoryId || editItem.subCategory}
                  disabled={!editItem.category || loadingSubcategories}
                  placeholder={
                    loadingSubcategories
                      ? "Loading subcategories..."
                      : editItem.category
                      ? "Select Sub Category"
                      : "Select Category first"
                  }
                  options={editSubCategoryOptions.map((sub) => ({
                    value: typeof sub === "object" ? sub.id || sub.name : sub,
                    label: typeof sub === "object" ? sub.name : sub,
                  }))}
                  onChange={(selectedVal) => {
                    const matched = editSubCategoryOptions.find(
                      (s) => s.id === selectedVal || s.name === selectedVal
                    );
                    const subId = matched?.id || selectedVal;
                    const subName = matched?.name || selectedVal;
                    setEditItem({
                      ...editItem,
                      subCategoryId: subId,
                      subCategory: subName,
                      designationId: "",
                      designation: "",
                    });
                    const isMongoId = /^[0-9a-fA-F]{24}$/.test(subId);
                    if (subId && isMongoId) {
                      dispatch(fetchDropdownDesignations(subId));
                    } else {
                      dispatch(clearDesignations());
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Designation</span>
                  {loadingDesignations && (
                    <span className="text-[11px] text-purple-600">Loading...</span>
                  )}
                </label>
                <CustomDropdown
                  value={editItem.designationId || editItem.designation}
                  disabled={!editItem.subCategory || loadingDesignations}
                  placeholder={
                    loadingDesignations
                      ? "Loading designations..."
                      : editItem.subCategory
                      ? "Select Designation"
                      : "Select Sub Category first"
                  }
                  options={editDesignationOptions.map((des) => ({
                    value: typeof des === "object" ? des.id || des.name : des,
                    label: typeof des === "object" ? des.name : des,
                  }))}
                  onChange={(selectedVal) => {
                    const matched = editDesignationOptions.find(
                      (d) => d.id === selectedVal || d.name === selectedVal
                    );
                    const desId = matched?.id || selectedVal;
                    const desName = matched?.name || selectedVal;
                    setEditItem({
                      ...editItem,
                      designationId: desId,
                      designation: desName,
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#8931BA] hover:bg-[#7828a5] rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (UI Standard ConfirmModal) */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Delete Database Record"
        message="Are you sure you want to delete this candidate database record?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default CandidateList;
