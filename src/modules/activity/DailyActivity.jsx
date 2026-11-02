import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Calendar,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Ban,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomDropdown from "../../components/common/CustomDropdown";
import {
  fetchDailyActivities,
  deleteDailyActivity,
  blockDailyActivity,
} from "../../redux/slice/activity/dailyActivitySlice";

const DailyActivity = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    activities: apiActivities,
    pagination,
    loadingActivities,
    deletingActivity,
  } = useSelector((state) => state.dailyActivity || {});

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blockModalItem, setBlockModalItem] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const itemsPerPage = 5;

  // Local storage blocked items state
  const [blockedMap, setBlockedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blocked_activities") || "{}");
    } catch {
      return {};
    }
  });

  // Fetch activities from backend API
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (statusFilter && statusFilter !== "All") params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;

    dispatch(fetchDailyActivities(params));
  }, [dispatch, currentPage, searchQuery, statusFilter, dateFilter]);

  // Format backend API daily activities for display
  const displayReports = useMemo(() => {
    if (Array.isArray(apiActivities) && apiActivities.length > 0) {
      return apiActivities.map((item, idx) => {
        const id = item._id || item.id || `act-${idx}`;

        // Support populated or string objects for category, subcategory, designation
        const categoryName = item.category?.name || item.category?.categoryName || (typeof item.category === "string" ? item.category : "");
        const subCategoryName = item.subCategory?.name || item.subCategory?.subcategoryName || item.role?.name || item.role || (typeof item.subCategory === "string" ? item.subCategory : "");
        const designationName = item.designation?.name || item.designation?.designationName || (typeof item.designation === "string" ? item.designation : "");

        let positionStr = item.position;
        if (!positionStr) {
          if (subCategoryName && designationName) {
            positionStr = `${subCategoryName} - ${designationName}`;
          } else {
            positionStr = designationName || subCategoryName || categoryName || "N/A";
          }
        }

        // Format date to clean DD/MM/YYYY
        const rawDate = item.date || item.reportDate || item.createdAt || "";
        let formattedDate = "";
        if (rawDate) {
          try {
            const dateOnly = rawDate.split("T")[0];
            const parts = dateOnly.split("-");
            if (parts.length === 3) {
              formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } else {
              formattedDate = dateOnly;
            }
          } catch {
            formattedDate = rawDate.split("T")[0];
          }
        }

        return {
          id,
          name: item.candidateName || item.name || "N/A",
          education: item.education || "N/A",
          position: positionStr,
          phoneNumber: item.phoneNumber || item.phone || item.contactNumber || "N/A",
          interactionType: item.interactionType || "Call",
          status: item.status || "Pending",
          date: formattedDate,
          isBlocked: Boolean(item.isBlocked || blockedMap[id]),
          original: item,
        };
      });
    }

    // When backend returns empty, show 0 items (no dummy data)
    return [];
  }, [apiActivities, blockedMap]);

  // Pagination calculation
  const totalRecords =
    pagination?.totalRecords ||
    (Array.isArray(apiActivities) && apiActivities.length > 0 ? apiActivities.length : displayReports.length);
  const totalPages =
    pagination?.totalPages || Math.ceil(totalRecords / itemsPerPage) || 1;

  // Slice if we are purely relying on local filtering
  const paginatedReports = useMemo(() => {
    if (Array.isArray(apiActivities) && apiActivities.length > 0) {
      return displayReports; // Already paginated from server
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayReports.slice(startIndex, startIndex + itemsPerPage);
  }, [apiActivities, displayReports, currentPage, itemsPerPage]);

  const handleDelete = (id) => {
    setDeleteModalId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalId) return;

    // Check if deleteModalId looks like a Mongo ID (24 hex characters)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(deleteModalId);
    if (isMongoId) {
      try {
        await dispatch(deleteDailyActivity(deleteModalId)).unwrap();
        toast.success("Work update deleted successfully!");
        dispatch(
          fetchDailyActivities({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery.trim() || undefined,
            status: statusFilter !== "All" ? statusFilter : undefined,
            date: dateFilter || undefined,
          })
        );
      } catch (err) {
        toast.error(err || "Failed to delete work update");
      }
    } else {
      // Local fallback removal
      try {
        const saved = JSON.parse(localStorage.getItem("work_reports") || "[]");
        const updated = saved.filter((r) => String(r.id) !== String(deleteModalId));
        localStorage.setItem("work_reports", JSON.stringify(updated));
        toast.success("Work update deleted successfully!");
      } catch (e) {
        console.error(e);
      }
    }
    setDeleteModalId(null);
  };

  const handleConfirmBlock = async () => {
    if (!blockModalItem) return;

    const targetId = blockModalItem.id;
    const willBlock = !blockModalItem.isBlocked;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(targetId);

    if (isMongoId) {
      try {
        await dispatch(blockDailyActivity({ id: targetId, isBlocked: willBlock })).unwrap();
        if (willBlock) {
          toast.success(
            `${blockModalItem.name || "Candidate"} blocked successfully!`
          );
        } else {
          toast.info(
            `${blockModalItem.name || "Candidate"} unblocked successfully!`
          );
        }
        dispatch(
          fetchDailyActivities({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery.trim() || undefined,
            status: statusFilter !== "All" ? statusFilter : undefined,
            date: dateFilter || undefined,
          })
        );
        setBlockModalItem(null);
        return;
      } catch (err) {
        console.error("API block call error, applying local fallback:", err);
      }
    }

    // Local fallback persistence
    const newBlocked = {
      ...blockedMap,
      [targetId]: willBlock,
    };
    setBlockedMap(newBlocked);
    try {
      localStorage.setItem("blocked_activities", JSON.stringify(newBlocked));
    } catch (e) {
      console.error(e);
    }

    if (willBlock) {
      toast.success(
        `${blockModalItem.name || "Candidate"} blocked successfully!`
      );
    } else {
      toast.info(
        `${blockModalItem.name || "Candidate"} unblocked successfully!`
      );
    }

    setBlockModalItem(null);
  };

  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-amber-500 font-semibold";
      case "completed":
        return "text-emerald-600 font-semibold";
      case "follow-up":
        return "text-blue-600 font-semibold";
      default:
        return "text-gray-600 font-medium";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] p-4 md:p-8 font-sans">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Daily Work Update
        </h1>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search Name here......"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] transition-all"
          />
        </div>

        {/* Right side controls: Status, Date, Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Select */}
          <div className="w-40">
            <CustomDropdown
              value={statusFilter}
              placeholder="All Status"
              options={[
                { value: "All", label: "All Status" },
                { value: "Pending", label: "Pending" },
                { value: "Completed", label: "Completed" },
                { value: "Selected", label: "Selected" },
                { value: "Rejected", label: "Rejected" },
                { value: "Processing", label: "Processing" },
                { value: "Non-Interested", label: "Non-Interested" },
              ]}
              onChange={(val) => {
                setStatusFilter(val || "All");
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-xs text-gray-600">
            <Calendar size={14} className="text-[#8931BA]" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="focus:outline-none text-xs text-gray-700 cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-gray-400 hover:text-red-500"
                title="Clear date"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Add Work Report Button */}
          <button
            type="button"
            onClick={() => navigate("/activity/add")}
            className="bg-[#8931BA] hover:bg-[#72239f] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add Work Report</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-xs mb-4 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#9333EA] text-white">
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                SR.NO
              </th>
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                NAME
              </th>
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                EDUCATION
              </th>
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                POSITION
              </th>
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                PHONE NUMBER
              </th>
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                INTERACTION TYPE
              </th>
              <th className="py-3 px-4 font-semibold text-xs tracking-wider whitespace-nowrap">
                STATUS
              </th>
              <th className="py-3 px-4 font-semibold text-center text-xs tracking-wider whitespace-nowrap">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700 bg-white">
            {loadingActivities ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#8931BA] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading daily activities...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedReports.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                  No work updates found matching your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedReports.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-purple-50/30 transition-colors border-b border-gray-100"
                >
                  {/* SR.NO */}
                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {/* NAME */}
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.isBlocked && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded font-semibold border border-red-200">
                          Blocked
                        </span>
                      )}
                    </div>
                  </td>

                  {/* EDUCATION */}
                  <td className="py-3.5 px-4 text-gray-600">
                    {item.education || "N/A"}
                  </td>

                  {/* POSITION */}
                  <td className="py-3.5 px-4 text-gray-700 font-medium">
                    {item.position}
                  </td>

                  {/* PHONE NUMBER */}
                  <td className="py-3.5 px-4 text-gray-600 font-mono">
                    {item.phoneNumber}
                  </td>

                  {/* INTERACTION TYPE */}
                  <td className="py-3.5 px-4 text-gray-700 font-medium">
                    {item.interactionType}
                  </td>

                  {/* STATUS */}
                  <td className="py-3.5 px-4">
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {/* View */}
                      <button
                        onClick={() => navigate(`/activity/view/${item.id}`)}
                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/activity/edit/${item.id}`)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Edit Report"
                      >
                        <Edit2 size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* Ban / Block */}
                      <button
                        onClick={() => setBlockModalItem(item)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          item.isBlocked
                            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                            : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                        }`}
                        title={item.isBlocked ? "Unblock Candidate" : "Block Candidate"}
                      >
                        <Ban size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-3 px-1 text-xs text-gray-600">
        <div>
          Showing{" "}
          <span className="font-semibold text-purple-700">
            {totalRecords === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-purple-700">
            {Math.min(currentPage * itemsPerPage, totalRecords)}
          </span>{" "}
          of <span className="font-semibold text-purple-700">{totalRecords}</span> Work Updates
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

      {/* Block Confirmation Modal (Exact UI Match) */}
      <ConfirmModal
        isOpen={Boolean(blockModalItem)}
        title="Are you sure you want to block?"
        message={`Are you sure you want to ${
          blockModalItem?.isBlocked ? "unblock" : "block"
        } ${blockModalItem?.name || "this candidate"}?`}
        confirmText={blockModalItem?.isBlocked ? "Unblock" : "Block"}
        cancelText="Cancel"
        onConfirm={handleConfirmBlock}
        onCancel={() => setBlockModalItem(null)}
      />

      {/* Delete Confirmation Modal (Exact UI Match) */}
      <ConfirmModal
        isOpen={Boolean(deleteModalId)}
        title="Delete Work Update"
        message="Are you sure you want to delete this work update?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalId(null)}
      />

      {/* End Table & Pagination */}
    </div>
  );
};

export default DailyActivity;
