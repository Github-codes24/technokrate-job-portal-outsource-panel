import React, { useState } from "react";
import {
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  Briefcase,
  Calendar,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/common/ConfirmModal";
import CustomDropdown from "../../components/common/CustomDropdown";

const CandidateDatabaseDetails = ({ database, onBack, onDownload, onUpdateDatabase }) => {
  const [candidates, setCandidates] = useState(database.candidates || []);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync state whenever database prop updates from API or upload
  React.useEffect(() => {
    if (database && Array.isArray(database.candidates)) {
      setCandidates(database.candidates);
    }
  }, [database]);

  const totalPages = Math.ceil(candidates.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCandidates = candidates.slice(startIndex, startIndex + itemsPerPage);

  // Save Candidate edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCandidate) return;

    const candKey = editingCandidate._id || editingCandidate.id;
    const updated = candidates.map((c, i) => {
      const currentKey = c._id || c.id || i;
      return currentKey === candKey ? editingCandidate : c;
    });
    setCandidates(updated);
    if (onUpdateDatabase) {
      onUpdateDatabase({
        ...database,
        candidates: updated,
        candidateCount: updated.length,
      });
    }
    setEditingCandidate(null);
    toast.success("Candidate details updated successfully!");
  };

  // Confirm delete candidate
  const handleConfirmDelete = () => {
    if (deleteCandidateId === null || deleteCandidateId === undefined) return;

    const updated = candidates.filter((c, i) => {
      const currentKey = c._id || c.id || i;
      return currentKey !== deleteCandidateId;
    });
    setCandidates(updated);
    if (onUpdateDatabase) {
      onUpdateDatabase({
        ...database,
        candidates: updated,
        candidateCount: updated.length,
      });
    }
    setDeleteCandidateId(null);
    toast.success("Candidate removed successfully!");
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] p-4 md:p-8 font-sans">
      {/* Top Details Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#8931BA] flex items-center justify-center shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Candidate Database Details
            </h1>
            <p className="text-xs text-gray-500">
              Viewing candidate database uploaded in Excel format
            </p>
          </div>
        </div>

        {/* Download File Button in Details Header */}
        {onDownload && (
          <button
            type="button"
            onClick={() => onDownload(database)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title={`Download ${database.fileName || "Excel file"}`}
          >
            <FileSpreadsheet size={15} />
            <span>Download Database Excel</span>
          </button>
        )}
      </div>

      {/* Meta Info Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Category Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Category
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {typeof database.category === "object"
                ? database.category?.name || database.category?.category || "—"
                : database.category || "NON-IT"}
            </p>
          </div>
        </div>

        {/* Subcategory Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Subcategory
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {typeof database.subCategory === "object"
                ? database.subCategory?.name || database.subCategory?.subCategory || "—"
                : database.subCategory || "Banking & Financial Services"}
            </p>
          </div>
        </div>

        {/* Designation Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Designation
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {typeof database.designation === "object"
                ? database.designation?.name || database.designation?.designation || "—"
                : database.designation || "Branch Manager"}
            </p>
          </div>
        </div>

        {/* Upload Date Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Upload Date
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {database.createdAt
                ? new Date(database.createdAt).toLocaleDateString("en-GB")
                : database.uploadDate || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Uploaded Candidates List
          </h2>
          <span className="text-xs font-semibold text-[#8931BA]">
            Total Records: <span className="font-bold">{candidates.length}</span>
          </span>
        </div>

        {/* Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-[#8931BA] uppercase tracking-wider bg-purple-50/40">
                <th className="py-3.5 px-5 whitespace-nowrap">SR. NO.</th>
                <th className="py-3.5 px-5 whitespace-nowrap">NAME</th>
                <th className="py-3.5 px-5 whitespace-nowrap">EMAIL</th>
                <th className="py-3.5 px-5 whitespace-nowrap">CONTACT</th>
                <th className="py-3.5 px-5 whitespace-nowrap">TECHNOLOGY</th>
                <th className="py-3.5 px-5 whitespace-nowrap">CITY</th>
                <th className="py-3.5 px-5 whitespace-nowrap">STATE</th>
                <th className="py-3.5 px-5 whitespace-nowrap">WORK MODE</th>
                <th className="py-3.5 px-5 text-center whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 bg-white">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-400 font-medium">
                    No candidates found in this database.
                  </td>
                </tr>
              ) : (
                currentCandidates.map((candidate, idx) => (
                  <tr
                    key={candidate.id || idx}
                    className="hover:bg-purple-50/20 transition-colors"
                  >
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-4 px-5 font-bold text-gray-900">
                      {candidate.name || candidate.candidateName || candidate.fullName || "—"}
                    </td>
                    <td className="py-4 px-5 text-gray-500 font-medium">
                      {candidate.email || candidate.emailId || candidate.mail || "—"}
                    </td>
                    <td className="py-4 px-5 text-gray-600 font-mono">
                      {candidate.contact || candidate.phone || candidate.mobile || candidate.phoneNumber || candidate.mobileNumber || "—"}
                    </td>
                    <td className="py-4 px-5 text-gray-800 font-medium">
                      {candidate.technology || candidate.skills || candidate.skill || candidate.designation || candidate.profile || database.designation || "—"}
                    </td>
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {candidate.city || candidate.location || "—"}
                    </td>
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {candidate.state || "—"}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {candidate.workMode || candidate.mode || "Remote"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCandidate({ ...candidate })}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200/60 rounded-lg transition-colors cursor-pointer"
                          title="Edit Candidate"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteCandidateId(candidate._id || candidate.id || idx)
                          }
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200/60 rounded-lg transition-colors cursor-pointer"
                          title="Delete Candidate"
                        >
                          <Trash2 size={14} />
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
        {candidates.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-5 border-t border-gray-100 text-xs text-gray-600 bg-white">
            <div>
              Showing <span className="font-semibold text-purple-700">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-purple-700">
                {Math.min(startIndex + itemsPerPage, candidates.length)}
              </span>{" "}
              of <span className="font-semibold text-purple-700">{candidates.length}</span> Candidates
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
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
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setEditingCandidate(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-gray-900 mb-4">Edit Candidate Details</h2>
            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingCandidate.name}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingCandidate.email}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  required
                  value={editingCandidate.contact}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, contact: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Technology</label>
                <input
                  type="text"
                  value={editingCandidate.technology || ""}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, technology: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editingCandidate.city || ""}
                    onChange={(e) =>
                      setEditingCandidate({ ...editingCandidate, city: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editingCandidate.state || ""}
                    onChange={(e) =>
                      setEditingCandidate({ ...editingCandidate, state: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Work Mode</label>
                <CustomDropdown
                  value={editingCandidate.workMode || "Remote"}
                  placeholder="Select Work Mode"
                  options={[
                    { value: "Remote", label: "Remote" },
                    { value: "Onsite", label: "Onsite" },
                    { value: "Hybrid", label: "Hybrid" },
                  ]}
                  onChange={(val) =>
                    setEditingCandidate({ ...editingCandidate, workMode: val })
                  }
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#8931BA] hover:bg-[#7828a5] rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidateId)}
        title="Delete Candidate Record"
        message="Are you sure you want to remove this candidate from the database?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidateId(null)}
      />
    </div>
  );
};

export default CandidateDatabaseDetails;
