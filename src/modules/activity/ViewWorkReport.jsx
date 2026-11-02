import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Layers,
  FileText,
  User,
  Tag,
  MessageSquare,
  Clock,
  Download,
  ExternalLink,
  Eye,
  X,
} from "lucide-react";
import { fetchDailyActivityById } from "../../redux/slice/activity/dailyActivitySlice";

const ViewWorkReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    activities: apiActivities,
    currentActivity,
    loadingCurrentActivity,
  } = useSelector((state) => state.dailyActivity || {});

  const [pdfModalUrl, setPdfModalUrl] = useState(null);
  const [pdfModalTitle, setPdfModalTitle] = useState(null);

  // Fetch report details directly from backend API
  useEffect(() => {
    if (id) {
      dispatch(fetchDailyActivityById(id));
    }
  }, [id, dispatch]);

  // Load target report from currentActivity, Redux activities, or fallback
  const report = useMemo(() => {
    const raw =
      currentActivity && (String(currentActivity._id) === String(id) || String(currentActivity.id) === String(id))
        ? currentActivity
        : Array.isArray(apiActivities)
        ? apiActivities.find((a) => String(a._id) === String(id) || String(a.id) === String(id))
        : null;

    if (raw) {
      // 1. Skills resolution (support array, comma-separated string, or keySkills)
      let skillsArray = [];
      const rawSkills = raw.keySkills || raw.skills || raw.skillsList;
      if (Array.isArray(rawSkills)) {
        skillsArray = rawSkills.filter(Boolean);
      } else if (typeof rawSkills === "string" && rawSkills.trim()) {
        skillsArray = rawSkills.split(",").map((s) => s.trim()).filter(Boolean);
      }

      // 2. Notes / Description resolution
      const notesContent =
        raw.notes ||
        raw.additionalNotes ||
        raw.discussionNotes ||
        raw.description ||
        raw.feedback ||
        "";

      // 3. Category, Subcategory, Designation resolution (support populated objects or strings)
      const catName =
        raw.category?.name ||
        raw.category?.categoryName ||
        (typeof raw.category === "string" ? raw.category : "");

      const subCatName =
        raw.subCategory?.name ||
        raw.subCategory?.subcategoryName ||
        raw.role?.name ||
        raw.role ||
        (typeof raw.subCategory === "string" ? raw.subCategory : "");

      const desigName =
        raw.designation?.name ||
        raw.designation?.designationName ||
        (typeof raw.designation === "string" ? raw.designation : "");

      // 4. Position formatting
      let positionStr = raw.position;
      if (!positionStr) {
        if (subCatName && desigName) {
          positionStr = `${subCatName} - ${desigName}`;
        } else {
          positionStr = desigName || subCatName || catName || "N/A";
        }
      }

      // 5. Resume File Name / URL resolution (support all variations and nested objects)
      const rawResume =
        raw.resume ||
        raw.resumeName ||
        raw.resumeUrl ||
        raw.resumeFile ||
        raw.cv ||
        raw.cvDriveLink ||
        raw.file ||
        raw.attachment ||
        raw.document;

      let resumeFileName = null;
      let resumeFileUrl = null;

      if (typeof rawResume === "string" && rawResume.trim()) {
        resumeFileName = rawResume.includes("/") ? rawResume.split("/").pop() : rawResume;
        resumeFileUrl = rawResume.startsWith("http") || rawResume.startsWith("blob:") || rawResume.startsWith("data:") ? rawResume : null;
      } else if (rawResume && typeof rawResume === "object") {
        resumeFileName = rawResume.name || rawResume.filename || rawResume.originalname || rawResume.url?.split("/").pop() || null;
        resumeFileUrl = rawResume.url || rawResume.path || rawResume.dataUrl || null;
      }

      // Check if resume was saved in local work_reports storage or resume_files storage
      try {
        const savedReports = JSON.parse(localStorage.getItem("work_reports") || "[]");
        const rawId = String(raw._id || raw.id || id || "");
        const rawPhone = String(raw.phoneNumber || raw.phone || raw.contactNumber || "").trim();
        const rawEmail = String(raw.email || "").trim().toLowerCase();
        const rawName = String(raw.candidateName || raw.name || "").trim().toLowerCase();

        const localMatch = savedReports.find((r) => {
          const matchId = String(r.id || r._id || "");
          if (rawId && matchId && (matchId === rawId || rawId.includes(matchId) || matchId.includes(rawId))) return true;
          if (rawEmail && r.email && r.email.toLowerCase() === rawEmail) return true;
          if (rawPhone && (r.phone === rawPhone || r.phoneNumber === rawPhone)) return true;
          if (rawName && (r.candidateName?.toLowerCase() === rawName || r.name?.toLowerCase() === rawName)) return true;
          if (resumeFileName && (r.resumeName === resumeFileName || r.resumeFileName === resumeFileName)) return true;
          return false;
        });

        if (localMatch?.resumeName && !resumeFileName) {
          resumeFileName = localMatch.resumeName;
        }
        if (localMatch?.resumeUrl || localMatch?.resumeDataUrl) {
          if (!resumeFileUrl) {
            resumeFileUrl = localMatch.resumeUrl || localMatch.resumeDataUrl;
          }
        }

        // Also check standalone resume cache by filename, ID, candidateName, or phone
        if (!resumeFileUrl) {
          const fileCache = JSON.parse(localStorage.getItem("uploaded_resumes") || "{}");
          if (resumeFileName && fileCache[resumeFileName]) {
            resumeFileUrl = fileCache[resumeFileName];
          } else if (resumeFileName && fileCache[decodeURIComponent(resumeFileName)]) {
            resumeFileUrl = fileCache[decodeURIComponent(resumeFileName)];
          } else if (rawId && fileCache[rawId]) {
            resumeFileUrl = fileCache[rawId];
          } else if (rawPhone && fileCache[rawPhone]) {
            resumeFileUrl = fileCache[rawPhone];
          } else if (rawName && fileCache[rawName]) {
            resumeFileUrl = fileCache[rawName];
          }
        }
      } catch {
        // Ignore
      }

      // Clean, formatted date helper
      const rawDateStr = raw.reportDate || raw.date || raw.createdAt || "";
      let formattedDateStr = "N/A";
      if (rawDateStr) {
        try {
          const dateOnly = rawDateStr.split("T")[0];
          const parts = dateOnly.split("-");
          if (parts.length === 3) {
            const [year, month, day] = parts;
            formattedDateStr = `${day}/${month}/${year}`;
          } else {
            const d = new Date(rawDateStr);
            if (!isNaN(d.getTime())) {
              formattedDateStr = d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }
          }
        } catch {
          formattedDateStr = rawDateStr.split("T")[0];
        }
      }

      return {
        id: raw._id || raw.id || id,
        name: raw.candidateName || raw.name || "N/A",
        email: raw.email || "N/A",
        education: raw.education || "N/A",
        category: catName || "IT",
        role: subCatName || "N/A",
        designation: desigName || "N/A",
        position: positionStr,
        phoneNumber: raw.phoneNumber || raw.phone || raw.contactNumber || "N/A",
        interactionType: raw.interactionType || "Call",
        status: raw.status || "Pending",
        skills: skillsArray.join(", "),
        skillsList: skillsArray,
        date: formattedDateStr,
        rawDate: rawDateStr.split("T")[0],
        state: raw.state || raw.location?.state || "",
        city: raw.city || raw.location?.city || "",
        location: raw.location || (raw.city && raw.state ? `${raw.city}, ${raw.state}` : raw.state || raw.city || ""),
        notes: notesContent,
        resumeName: resumeFileName,
        resumeUrl: resumeFileUrl,
      };
    }

    // Check localStorage fallback
    try {
      const saved = JSON.parse(localStorage.getItem("work_reports") || "[]");
      const found = saved.find(
        (r) => String(r.id) === String(id) || String(r._id) === String(id)
      );
      if (found) {
        let skillsArray = [];
        if (Array.isArray(found.skills)) skillsArray = found.skills;
        else if (typeof found.skills === "string") {
          skillsArray = found.skills.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return {
          ...found,
          skillsList: skillsArray,
          notes: found.notes || "",
        };
      }
    } catch (err) {
      console.error("Error finding report:", err);
    }

    return null;
  }, [id, currentActivity, apiActivities]);

  if (loadingCurrentActivity) {
    return (
      <div className="min-h-screen bg-[#FDFBFD] p-6 font-sans flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md">
          <div className="w-8 h-8 border-3 border-[#8931BA] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Loading Report Details</h2>
          <p className="text-xs text-gray-500">
            Fetching daily activity report from server...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FDFBFD] p-6 font-sans flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-md">
          <FileText size={48} className="text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">Work Report Not Found</h2>
          <p className="text-xs text-gray-500 mb-4">
            The requested work report does not exist or may have been deleted.
          </p>
          <button
            onClick={() => navigate("/activity")}
            className="px-4 py-2 bg-[#8931BA] hover:bg-[#72239f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Back to Daily Activity
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "selected":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "follow-up":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const skillsList =
    Array.isArray(report.skillsList) && report.skillsList.length > 0
      ? report.skillsList
      : report.skills
      ? report.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  return (
    <div className="min-h-screen bg-[#FDFBFD] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/activity")}
              className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Back to Daily Activity"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Work Report Details
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Report ID: <span className="font-mono font-semibold text-[#8931BA]">#{report.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* <button
              type="button"
              onClick={() => navigate(`/activity/edit/${report.id}`)}
              className="px-4 py-2 bg-[#8931BA] hover:bg-[#72239f] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 size={14} />
              <span>Edit Report</span>
            </button> */}
          </div>
        </div>

        {/* Candidate Profile Summary Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8931BA] to-indigo-700 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                {report.name ? report.name.charAt(0).toUpperCase() : "C"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold text-gray-900">{report.name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusBadge(
                      report.status
                    )}`}
                  >
                    {report.status || "Pending"}
                  </span>
                </div>
                <p className="text-xs font-semibold text-purple-700 mt-1">
                  {report.position || (report.role ? `${report.role} - ${report.designation}` : "N/A")}
                </p>
              </div>
            </div>

            {/* Quick date & interaction info */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={13} className="text-[#8931BA]" />
                <span className="font-medium">Date:</span>
                <span className="font-semibold text-gray-800">{report.date || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Clock size={13} className="text-blue-600" />
                <span className="font-medium">Interaction:</span>
                <span className="font-semibold text-gray-800">{report.interactionType || "Call"}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100">
              <Phone size={16} className="text-[#8931BA] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Phone Number
                </span>
                <span className="text-xs font-semibold text-gray-800 font-mono truncate block">
                  {report.phoneNumber || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100">
              <Mail size={16} className="text-[#8931BA] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Email Address
                </span>
                <span className="text-xs font-semibold text-gray-800 truncate block">
                  {report.email || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100">
              <MapPin size={16} className="text-[#8931BA] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Location
                </span>
                <span className="text-xs font-semibold text-gray-800 truncate block">
                  {report.city ? `${report.city}, ` : ""}
                  {report.state || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Professional Information Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Briefcase size={16} className="text-[#8931BA]" /> Professional Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Category:</span>
                <span className="font-semibold text-gray-900 bg-purple-50 text-[#8931BA] px-2 py-0.5 rounded-md">
                  {report.category || "IT"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Role (Sub-Category):</span>
                <span className="font-semibold text-gray-900">
                  {report.role || report.position?.split(" - ")[0] || "N/A"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Designation:</span>
                <span className="font-semibold text-gray-900">
                  {report.designation || report.position?.split(" - ")[1] || report.position || "N/A"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">Education:</span>
                <span className="font-semibold text-gray-900">
                  {report.education || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Interaction & Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Layers size={16} className="text-[#8931BA]" /> Interaction & Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Interaction Type:</span>
                <span className="font-semibold text-gray-900">{report.interactionType || "Call"}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Current Status:</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge(report.status)}`}>
                  {report.status || "Pending"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Report Date:</span>
                <span className="font-semibold text-gray-900">{report.date || "N/A"}</span>
              </div>

              <div className="flex justify-between py-1 items-center">
                <span className="text-gray-500 font-medium">Resume File:</span>
                <span className="font-semibold text-gray-900">
                  {report.resumeName ? (
                    <button
                      type="button"
                      onClick={() => {
                        const targetUrl = report.resumeUrl;
                        const resumeTitle = report.resumeName || `${report.name}_Resume.pdf`;

                        if (targetUrl) {
                          if (targetUrl.startsWith("http")) {
                            setPdfModalUrl(targetUrl);
                            setPdfModalTitle(resumeTitle);
                            return;
                          }

                          // If base64 data url, convert to binary Blob URL for embedding
                          if (targetUrl.startsWith("data:") || !targetUrl.startsWith("http")) {
                            try {
                              let base64Data = targetUrl;
                              let mimeType = "application/pdf";
                              if (targetUrl.includes(",")) {
                                const [header, data] = targetUrl.split(",");
                                base64Data = data;
                                mimeType = header.split(";")[0].replace("data:", "") || "application/pdf";
                              }

                              const binaryString = window.atob(base64Data);
                              const len = binaryString.length;
                              const bytes = new Uint8Array(len);
                              for (let i = 0; i < len; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                              }
                              const blob = new Blob([bytes], { type: "application/pdf" });
                              const blobUrl = URL.createObjectURL(blob);
                              setPdfModalUrl(blobUrl);
                              setPdfModalTitle(resumeTitle);
                              return;
                            } catch (e) {
                              console.error("PDF Blob generation error:", e);
                              setPdfModalUrl(targetUrl);
                              setPdfModalTitle(resumeTitle);
                              return;
                            }
                          }
                        }

                        // If no binary data in cache, open modal in candidate view mode
                        setPdfModalUrl(null);
                        setPdfModalTitle(resumeTitle);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#8931BA] hover:text-[#72239f] border border-purple-200/80 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                      title="Click to view PDF"
                    >
                      <FileText size={14} className="text-[#8931BA]" />
                      <span className="underline underline-offset-2">{report.resumeName}</span>
                      <Eye size={12} className="opacity-70 group-hover:opacity-100 transition-all text-[#8931BA]" />
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">No resume uploaded</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Tag size={15} className="text-[#8931BA]" /> Key Skills & Technologies
          </h3>
          {skillsList.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-50/70 border border-purple-200/60 text-[#8931BA] rounded-lg text-xs font-semibold shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No specific skills listed for this report.</p>
          )}
        </div>

        {/* Additional Notes Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={15} className="text-[#8931BA]" /> Additional Discussion Notes
          </h3>
          <div className="bg-gray-50/70 border border-gray-200/70 rounded-xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {report.notes ? (
              report.notes
            ) : (
              <span className="text-gray-400 italic">No additional notes recorded.</span>
            )}
          </div>
        </div>

        {/* PDF In-Page Preview Modal */}
        {pdfModalTitle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white border-b border-gray-800">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <FileText size={16} className="text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold truncate text-white">{pdfModalTitle}</h3>
                    <p className="text-[10px] text-gray-400">Candidate Attached Resume</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pdfModalUrl && (
                    <a
                      href={pdfModalUrl}
                      download={pdfModalTitle}
                      className="px-3 py-1.5 bg-[#8931BA] hover:bg-[#72239f] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setPdfModalTitle(null);
                      setPdfModalUrl(null);
                    }}
                    className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Close Preview"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Content: PDF Iframe or Structured Profile Document */}
              <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
                {pdfModalUrl ? (
                  <iframe
                    src={`${pdfModalUrl}#toolbar=1`}
                    title="Resume Document"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full p-6 sm:p-10 overflow-y-auto flex justify-center">
                    <div className="bg-white max-w-2xl w-full p-8 rounded-xl shadow-md border border-gray-200 space-y-6 my-auto">
                      <div className="border-b-2 border-[#8931BA] pb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{report.name}</h2>
                        <p className="text-[#8931BA] font-semibold text-sm mt-0.5">{report.role || report.designation || "Applicant"}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-3">
                          {report.phoneNumber && <span>📞 {report.phoneNumber}</span>}
                          {report.email && <span>✉️ {report.email}</span>}
                          {report.location && <span>📍 {report.location}</span>}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1">Professional Profile</div>
                        <div className="grid grid-cols-2 gap-2 text-gray-600">
                          <div><span className="text-gray-400">Category:</span> <span className="font-semibold text-gray-800">{report.category}</span></div>
                          <div><span className="text-gray-400">Education:</span> <span className="font-semibold text-gray-800">{report.education}</span></div>
                          <div><span className="text-gray-400">Role:</span> <span className="font-semibold text-gray-800">{report.role}</span></div>
                          <div><span className="text-gray-400">Designation:</span> <span className="font-semibold text-gray-800">{report.designation}</span></div>
                        </div>
                      </div>

                      {skillsList.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1">Key Skills</div>
                          <div className="flex flex-wrap gap-1.5">
                            {skillsList.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-purple-50 text-[#8931BA] border border-purple-200 rounded text-xs font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.notes && (
                        <div className="space-y-1.5">
                          <div className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1">Candidate Notes</div>
                          <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">{report.notes}</p>
                        </div>
                      )}

                      <div className="text-center pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                        Linked File: <span className="font-semibold text-gray-600">{pdfModalTitle}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewWorkReport;
