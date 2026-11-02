import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSingleVacancy,
  fetchVacancyApplications,
  updateApplicationStatus,
} from "../../redux/slice/vacancy/vacancySlice";
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Eye,
  Check,
  X,
  Users,
  MapPin,
  Monitor,
  Calendar,
  DollarSign,
  AlertCircle,
  Home,
  ChevronRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Footer from "../../components/common/Footer";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const fmt = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  const yr = d.getFullYear();
  return `${day}-${mon}-${yr}`;
};

const fmtTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────

const Dropdown = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs text-gray-700 font-medium hover:border-gray-300 shadow-sm cursor-pointer"
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""} text-gray-400`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 min-w-[150px] bg-white border border-gray-100 rounded-lg shadow-lg py-1 overflow-y-auto max-h-52">
          {options.map((o) => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                value === o.value
                  ? "bg-purple-50 text-[#8931BA] font-bold"
                  : "text-gray-700 hover:bg-purple-50 hover:text-[#8931BA]"
              }`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, displayStatus, statusLabel, isAccepted, isRejected, isOnHold }) => {
  const label = displayStatus || statusLabel || status || "Pending";
  const s = String(status || label || "").toLowerCase().trim();

  let cls = "border border-purple-200 text-[#8931BA] bg-purple-50";

  if (isAccepted || s === "accepted" || s === "shortlisted") {
    cls = "border border-emerald-300 text-emerald-700 bg-emerald-50";
  } else if (isRejected || s === "rejected") {
    cls = "border border-rose-300 text-rose-700 bg-rose-50";
  } else if (isOnHold || s === "on hold" || s === "onhold" || s === "hold") {
    cls = "border border-amber-300 text-amber-800 bg-amber-50";
  } else if (s === "interviewed") {
    cls = "border border-blue-300 text-blue-700 bg-blue-50";
  } else if (s === "submitted" || s === "applied") {
    cls = "border border-purple-300 text-purple-700 bg-purple-50";
  } else if (s === "pending") {
    cls = "border border-yellow-300 text-yellow-800 bg-yellow-50";
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap leading-none ${cls}`}>
      {label}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ViewSubmittedApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentVacancy, applications, loading, error } = useSelector(
    (state) => state.vacancy
  );
  
  // ── filter state ──
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("All");
  const [expFilter, setExpFilter] = useState("All");
  const [noticeFilter, setNoticeFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleVacancy(id));
      dispatch(fetchVacancyApplications({ id, params: {} }));
    }
  }, [dispatch, id]);

  // ── vacancy fields ──
  const v = currentVacancy || {};
  const vacancyId = v.vacancyId || v.id || v._id || id;
  const noOfVacancies = v.numberOfVacancies ?? v.candidatesCount ?? 0;
  const location = v.city
    ? v.state ? `${v.city}, ${v.state}` : v.city
    : v.location || "N/A";
  const workMode = v.workMode || v.jobType || "Onsite";
  const hiringType = v.hiring || v.hiringType || "External";
  const budget = v.budget || v.salary || v.salaryRange || v.ctc || "N/A";
  const timeline = v.timeline || "Immediate";
  const category = v.category || v.department || "IT";
  const subCategory = v.subCategory || "45 Days";
  const deadline = fmt(v.deadline);
  const submittedCount = v.submittedCount ?? v.applicationSubmittedCount ?? 0;
  const filledStatus =
    v.status === "Filled" ||
    (noOfVacancies > 0 && submittedCount >= noOfVacancies);

  // ── filter applications ──
  const experienceOptions = [
    { value: "All", label: "All Experience" },
    { value: "0-1", label: "0-1 Years" },
    { value: "1-3", label: "1-3 Years" },
    { value: "3-5", label: "3-5 Years" },
    { value: "5+", label: "5+ Years" },
  ];

  const noticePeriodOptions = [
    { value: "All", label: "Any Notice Period" },
    { value: "Immediate", label: "Immediate Joiner" },
    { value: "15", label: "15 Days" },
    { value: "30", label: "30 Days" },
    { value: "60", label: "60 Days" },
    { value: "90", label: "90 Days" },
  ];

  
  const filtered = applications.filter((app) => {
    const name = (app.fullName || "").toLowerCase();
    const email = (app.email || "").toLowerCase();
    const phone = app.phone || "";
    const appId = (app.applicationId || app.id || "").toLowerCase();

    const matchSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search) ||
      appId.includes(search.toLowerCase());

    const appStatus = (app.status || "").toLowerCase();
    const appDisplay = (app.displayStatus || app.statusLabel || "").toLowerCase();
    const matchStatus =
      statusTab === "All" ||
      (statusTab === "Pending" && (appStatus === "pending" || appStatus === "applied" || appDisplay === "pending")) ||
      (statusTab === "On Hold" && (app.isOnHold || appStatus === "on hold" || appStatus === "onhold" || appDisplay === "on hold" || appStatus === "submitted")) ||
      (statusTab === "Accepted" && (app.isAccepted || appStatus === "accepted" || appDisplay === "accepted")) ||
      (statusTab === "Shortlisted" && (appStatus === "shortlisted" || appDisplay === "shortlisted")) ||
      (statusTab === "Interviewed" && (appStatus === "interviewed" || appDisplay === "interviewed")) ||
      (statusTab === "Rejected" && (app.isRejected || appStatus === "rejected" || appDisplay === "rejected"));

    const exp = parseFloat(app.totalExperience || app.experience || 0);
    const matchExp =
      expFilter === "All" ||
      (expFilter === "0-1" && exp >= 0 && exp < 1) ||
      (expFilter === "1-3" && exp >= 1 && exp < 3) ||
      (expFilter === "3-5" && exp >= 3 && exp < 5) ||
      (expFilter === "5+" && exp >= 5);

    const np = (app.noticePeriod || "").toLowerCase();
    const matchNotice =
      noticeFilter === "All" ||
      (noticeFilter === "Immediate" && np.includes("immediate")) ||
      (noticeFilter === "15" && np.includes("15")) ||
      (noticeFilter === "30" && np.includes("30")) ||
      (noticeFilter === "60" && np.includes("60")) ||
      (noticeFilter === "90" && np.includes("90"));

    return matchSearch && matchStatus && matchExp && matchNotice;
  });

  // ── select all ──
  const allSelected =
    filtered.length > 0 &&
    filtered.every((a) => selectedIds.includes(a.id || a._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id || a._id));
    }
  };

  const toggleSelect = (appId) => {
    setSelectedIds((prev) =>
      prev.includes(appId) ? prev.filter((x) => x !== appId) : [...prev, appId]
    );
  };

  // ── active filters chips ──
  const activeFilters = [];
  if (expFilter !== "All") {
    const found = experienceOptions.find((o) => o.value === expFilter);
    activeFilters.push({ label: `Experience: ${found?.label || expFilter}`, clear: () => setExpFilter("All") });
  }
  if (noticeFilter !== "All") {
    const found = noticePeriodOptions.find((o) => o.value === noticeFilter);
    activeFilters.push({ label: `Notice: ${found?.label || noticeFilter}`, clear: () => setNoticeFilter("All") });
  }
  if (statusTab !== "All") {
    activeFilters.push({ label: `Status: ${statusTab}`, clear: () => setStatusTab("All") });
  }

  const clearAllFilters = () => {
    setExpFilter("All");
    setNoticeFilter("All");
    setStatusTab("All");
    setSearch("");
  };

  // ── handle status update ──
  const handleStatusUpdate = (appId, newStatus) => {
    dispatch(updateApplicationStatus({ id: appId, status: newStatus }));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-6 font-sans flex flex-col justify-between">
      <div>
        {/* ── Breadcrumb ── */}
        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
            <p className="text-[#9233eacc] font-bold text-base sm:text-xs md:text-sm truncate">Back</p>
        </div>

        {/* ── Vacancy Info Card ── */}
        {loading && !currentVacancy ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex items-center justify-center mb-5">
            <div className="w-8 h-8 border-4 border-[#8931BA] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="flex flex-wrap items-start gap-5">
              {/* Left: title block */}
              <div className="min-w-[160px]">
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                  Submitted<br />Applications
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      filledStatus
                        ? "bg-red-50 border-red-300 text-red-600"
                        : "bg-purple-50 border-purple-300 text-purple-700"
                    }`}
                  >
                    {filledStatus
                      ? `Filled (${submittedCount}/${noOfVacancies} Applied)`
                      : `${submittedCount} Applied`}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500 font-medium">
                  • {category} • {subCategory}
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px self-stretch bg-gray-100 mx-1" />

              {/* Vacancy code */}
              <div className="flex flex-col justify-center">
                <span className="text-xs text-gray-400 font-medium">Vacancy ID</span>
                <span className="text-sm font-bold text-gray-700 mt-0.5">({vacancyId})</span>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px self-stretch bg-gray-100 mx-1" />

              {/* Info badges */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 flex-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <Users size={13} className="text-gray-400" />
                  Vacancies: <strong>{noOfVacancies}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <MapPin size={13} className="text-gray-400" />
                  {location}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <Monitor size={13} className="text-gray-400" />
                  {workMode}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  Hiring:{" "}
                  <strong
                    className={
                      hiringType.toLowerCase() === "external"
                        ? "text-[#8931BA]"
                        : "text-blue-600"
                    }
                  >
                    {hiringType}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  Original Budget:{" "}
                  <strong className="text-gray-800">{budget}</strong>
                </span>

                {/* Row 2 */}
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium basis-full md:basis-auto">
                  Timeline:{" "}
                  <strong className="text-[#8931BA]">{timeline}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <Calendar size={13} className="text-gray-400" />
                  Deadline: <strong className="text-gray-800">{deadline}</strong>
                </span>
                {filledStatus && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-red-300 bg-red-50 text-red-600">
                    <AlertCircle size={12} />
                    Applications Filled
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Filters Row ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search candidate name, email, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA]/40"
              />
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={14} className="text-gray-400" />
              {["All", "Pending", "On Hold", "Accepted", "Rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    statusTab === tab
                      ? "bg-[#8931BA] text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Dropdowns */}
            <Dropdown
              value={expFilter}
              onChange={setExpFilter}
              options={experienceOptions}
              placeholder="All Experience"
            />
            <Dropdown
              value={noticeFilter}
              onChange={setNoticeFilter}
              options={noticePeriodOptions}
              placeholder="Any Notice Period"
            />
          </div>

          {/* Results bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">
              Total found:{" "}
              <strong className="text-gray-900">{filtered.length}</strong>
            </span>
            {filledStatus && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                Filled
              </span>
            )}
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 font-medium hover:bg-gray-50 cursor-pointer"
            >
              <Check size={12} />
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 font-medium hover:bg-gray-50 cursor-pointer">
              <Download size={12} />
              Export
            </button>
          </div>

          {/* Active Filters chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
              {activeFilters.map((f) => (
                <span
                  key={f.label}
                  className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-200 rounded-full text-[11px] text-[#8931BA] font-bold"
                >
                  {f.label}
                  <button onClick={f.clear} className="cursor-pointer hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#8931BA] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500 font-medium">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">Error loading applications</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-[#8931BA]">
                    {/* Checkbox */}
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-white accent-white cursor-pointer"
                      />
                    </th>
                    {[
                      "Sr.",
                      "Application Id",
                      "Candidate Name",
                      "Role & Category",
                      "Contact Details",
                      "Location",
                      "Submitted By (Partner)",
                      "Current Org",
                      "Notice",
                      "Expected Ctc",
                      "Applied Date & Time",
                      "Cv / Resume",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-bold text-white uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={15}
                        className="px-6 py-16 text-center text-sm text-gray-400"
                      >
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((app, idx) => {
                      const appId = app.id || app._id;
                      const applicationCode =
                        app.applicationId || appId || `APP-${idx + 1}`;
                      const isSelected = selectedIds.includes(appId);
                      const expYrs = app.totalExperience || app.experience;
                      const partner =
                        app.submittedBy?.hrName ||
                        app.submittedBy?.name ||
                        app.referredBy ||
                        app.partnerName ||
                        "—";
                      const partnerType = app.submittedBy?.role || "Outsource Partner";
                      const cvLink = app.resumeLink || app.cvDriveLink;
                      const noticePeriod = app.noticePeriod || "Immediate Joiner";
                      const expectedCTC = app.expectedCTC || app.expectedSalary || "—";
                      const appliedAt = app.createdAt || app.submittedAt;
                      const cityLocation = app.city
                        ? app.state
                          ? `${app.city}, ${app.state}`
                          : app.city
                        : app.location || "—";

                      return (
                        <tr
                          key={appId || idx}
                          className={`border-b border-gray-100 transition-colors ${
                            isSelected ? "bg-purple-50/40" : "hover:bg-gray-50/60"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(appId)}
                              className="w-3.5 h-3.5 rounded border-gray-300 accent-[#8931BA] cursor-pointer"
                            />
                          </td>

                          {/* Sr. */}
                          <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                            {idx + 1}
                          </td>

                          {/* Application Id */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                navigate(`/vacancies/application-details/${appId}`)
                              }
                              className="text-xs font-bold text-[#8931BA] hover:underline cursor-pointer"
                            >
                              {applicationCode}
                            </button>
                          </td>

                          {/* Candidate Name */}
                          <td className="px-4 py-3">
                            <div className="text-xs font-bold text-gray-900 uppercase">
                              {app.fullName || "—"}
                            </div>
                            {expYrs && (
                              <div className="text-[11px] text-[#8931BA] font-semibold mt-0.5">
                                {expYrs} Yrs Exp
                              </div>
                            )}
                          </td>

                          {/* Role & Category */}
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-600 font-medium">
                              {app.vacancyProfile || "N/A"}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {category} • {subCategory}
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td className="px-4 py-3">
                            {app.email && (
                              <div className="flex items-center gap-1 text-[11px] text-gray-600">
                                <span className="text-gray-400">✉</span>
                                <span className="truncate max-w-[130px]" title={app.email}>
                                  {app.email}
                                </span>
                              </div>
                            )}
                            {app.phone && (
                              <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-0.5">
                                <span className="text-gray-400">✆</span>
                                {app.phone}
                              </div>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3 text-xs text-gray-700 font-medium whitespace-nowrap">
                            {cityLocation}
                          </td>

                          {/* Submitted By (Partner) */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                <FileText size={11} />
                              </span>
                              <div>
                                <div className="text-[11px] font-bold text-[#8931BA] truncate max-w-[110px]">
                                  {partner}
                                </div>
                                <div className="text-[10px] text-gray-400">{partnerType}</div>
                              </div>
                            </div>
                          </td>

                          {/* Current Org */}
                          <td className="px-4 py-3 text-xs text-gray-700 font-medium whitespace-nowrap">
                            {app.currentOrganization || app.currentCompany || "—"}
                          </td>

                          {/* Notice */}
                          <td className="px-4 py-3 text-xs text-gray-700 font-medium whitespace-nowrap">
                            {noticePeriod}
                          </td>

                          {/* Expected CTC */}
                          <td className="px-4 py-3 text-xs text-gray-700 font-medium whitespace-nowrap">
                            {expectedCTC}
                          </td>

                          {/* Applied Date & Time */}
                          <td className="px-4 py-3">
                            <div className="text-[11px] font-bold text-gray-800 whitespace-nowrap">
                              {fmt(appliedAt)}
                            </div>
                            <div className="text-[11px] text-[#8931BA] font-semibold mt-0.5">
                              {fmtTime(appliedAt)}
                            </div>
                          </td>

                          {/* CV / Resume */}
                          <td className="px-4 py-3">
                            {cvLink ? (
                              <a
                                href={cvLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-[#8931BA] hover:underline"
                              >
                                View CV
                              </a>
                            ) : (
                              <span className="text-[11px] text-gray-400">No CV</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge
                              status={app.status}
                              displayStatus={app.displayStatus}
                              statusLabel={app.statusLabel}
                              isAccepted={app.isAccepted}
                              isRejected={app.isRejected}
                              isOnHold={app.isOnHold}
                            />
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {/* View */}
                              <button
                                onClick={() =>
                                  navigate(`/vacancies/application-details/${appId}`)
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-full border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={13} />
                              </button>

                              {/* Accept */}
                              <button
                                onClick={() => handleStatusUpdate(appId, "Accepted")}
                                className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
                                  (app.status || "").toLowerCase() === "accepted"
                                    ? "border-green-400 bg-green-50 text-green-600"
                                    : "border-green-300 text-green-500 hover:bg-green-50"
                                }`}
                                title="Accept"
                              >
                                <Check size={13} />
                              </button>

                              {/* Reject */}
                              <button
                                onClick={() => handleStatusUpdate(appId, "Rejected")}
                                className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
                                  (app.status || "").toLowerCase() === "rejected"
                                    ? "border-red-400 bg-red-50 text-red-600"
                                    : "border-red-300 text-red-400 hover:bg-red-50"
                                }`}
                                title="Reject"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ViewSubmittedApplications;
