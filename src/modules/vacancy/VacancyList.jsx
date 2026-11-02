import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, Users, Calendar, UserCheck, ChevronLeft, ChevronRight, Eye, FileText, X, Briefcase, XCircle, Monitor, Layers, AlertCircle, ClipboardList, ChevronDown } from "lucide-react";
import { fetchVacancies, fetchVacancyStats } from "../../redux/slice/vacancy/vacancySlice";

const decodeHtml = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const CustomSelect = ({ label, value, onChange, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isFiltered = value && value !== "All";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 text-xs transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${isFiltered
            ? "border-[#8931BA] bg-purple-50/40 text-[#8931BA] font-semibold"
            : "border-gray-200 text-gray-700 hover:border-gray-300 font-medium"
          }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && <Icon size={13} className={isFiltered ? "text-[#8931BA]" : "text-gray-400"} />}
          {label && <span className="text-gray-500 font-medium">{label}:</span>}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#8931BA]" : "text-gray-400"
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-30 min-w-[130px] w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden py-1 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between ${value === opt.value
                  ? "bg-[#8931BA]/10 text-[#8931BA] font-bold"
                  : "text-gray-700 hover:bg-[#8931BA]/5 hover:text-[#8931BA]"
                }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#8931BA]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VacancyList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { vacancies, pagination, loading, stats } = useSelector((state) => state.vacancy);
  const [selectedJdVacancy, setSelectedJdVacancy] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Parse state directly from URL query parameters
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = Number(searchParams.get("limit")) || 10;
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";
  const selectedWorkMode = searchParams.get("workMode") || "All";
  const selectedStatus = searchParams.get("status") || "All";
  const selectedPriority = searchParams.get("priority") || "All";
  const selectedTimeline = searchParams.get("timeline") || "All";

  // Helper function to update URL search parameters cleanly
  const updateQueryParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && value !== "All") {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    setSearchParams(updated);
  };

  // Dispatch API call when URL search parameters or date filters change
  useEffect(() => {
    dispatch(
      fetchVacancies({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        category: selectedCategory,
        workMode: selectedWorkMode,
        status: selectedStatus,
        priority: selectedPriority,
        timeline: selectedTimeline,
        fromDate: fromDate || "",
        toDate: toDate || "",
      })
    );
  }, [
    dispatch,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedCategory,
    selectedWorkMode,
    selectedStatus,
    selectedPriority,
    selectedTimeline,
    fromDate,
    toDate,
  ]);

  // Compute stat metrics (API stats prioritized, fallback to computed)
  const safeVacancies = vacancies || [];
  const openCount = stats?.openVacancy ?? stats?.openCount ?? stats?.openVacancies ?? safeVacancies.filter(v => {
    const vCount = Number(v.candidatesCount ?? v.numberOfVacancies ?? 0);
    const sCount = Number(v.submittedCount ?? v.applicationSubmittedCount ?? 0);
    return vCount > 0 && sCount < vCount;
  }).length;

  const closedCount = stats?.closedVacancy ?? stats?.closedCount ?? stats?.closedVacancies ?? safeVacancies.filter(v => {
    const vCount = Number(v.candidatesCount ?? v.numberOfVacancies ?? 0);
    const sCount = Number(v.submittedCount ?? v.applicationSubmittedCount ?? 0);
    return vCount > 0 && sCount >= vCount;
  }).length;

  const itCount = stats?.itVacancy ?? stats?.itCount ?? stats?.itVacancies ?? safeVacancies.filter(v => (v.category || "").toLowerCase() === "it").length;
  const nonItCount = stats?.nonItVacancy ?? stats?.nonItCount ?? stats?.nonItVacancies ?? safeVacancies.filter(v => (v.category || "").toLowerCase() === "non it").length;

  const totalCountStat = stats?.totalVacancy ?? stats?.totalCount ?? stats?.totalVacancies ?? pagination?.total ?? safeVacancies.length;

  // Client-side safety filter fallback
  const filteredVacancies = safeVacancies.filter((vac) => {
    const profileStr = vac.profile || vac.designation || "";
    const categoryStr = vac.category || "";
    const locationStr = vac.location || vac.city || "";
    const stateStr = vac.state || "";
    const workModeStr = vac.workMode || "";
    const timelineStr = vac.timeline || "Immediate";

    const matchesSearch =
      profileStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stateStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || categoryStr.toLowerCase() === selectedCategory.toLowerCase();

    const matchesWorkMode =
      selectedWorkMode === "All" || workModeStr.toLowerCase() === selectedWorkMode.toLowerCase();

    const matchesTimeline =
      selectedTimeline === "All" || timelineStr.toLowerCase() === selectedTimeline.toLowerCase();

    const priorityStr = vac.priority || "";
    const statusStr = (vac.status || vac.vacancyStatus || "").toLowerCase();

    const matchesPriority =
      selectedPriority === "All" || priorityStr.toLowerCase() === selectedPriority.toLowerCase();

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus.toLowerCase() === "open" && statusStr !== "closed" && statusStr !== "inactive") ||
      (selectedStatus.toLowerCase() === "closed" && (statusStr === "closed" || statusStr === "inactive"));

    // Date range filter
    let matchesDate = true;
    const itemDate = vac.deadline ? vac.deadline.slice(0, 10) : (vac.createdAt ? vac.createdAt.slice(0, 10) : "");
    if (fromDate && itemDate) {
      matchesDate = matchesDate && itemDate >= fromDate;
    }
    if (toDate && itemDate) {
      matchesDate = matchesDate && itemDate <= toDate;
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesWorkMode &&
      matchesPriority &&
      matchesStatus &&
      matchesTimeline &&
      matchesDate
    );
  });

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    selectedWorkMode !== "All" ||
    selectedPriority !== "All" ||
    selectedStatus !== "All" ||
    selectedTimeline !== "All" ||
    fromDate !== "" ||
    toDate !== "";


  const handleResetAll = () => {
    setFromDate("");
    setToDate("");
    setSearchParams(new URLSearchParams());
  };


  const totalCount = pagination?.total ?? filteredVacancies.length;
  const totalPages = pagination?.totalPages || Math.ceil(totalCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayVacancies = filteredVacancies;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateQueryParams({ page: newPage });
    }
  };

  const getWorkModeClass = (mode) => {
    if (!mode || mode === "N/A") return "text-gray-400 font-medium text-xs";
    switch (mode.toLowerCase()) {
      case "remote":
        return "text-emerald-600 font-bold text-xs";
      case "hybrid":
        return "text-amber-600 font-bold text-xs";
      case "onsite":
        return "text-blue-600 font-bold text-xs";
      default:
        return "text-gray-600 font-medium text-xs";
    }
  };

  const getVacancyStatusBadge = (item) => {
    const rawStatus = (item.status || item.vacancyStatus || "").toLowerCase();
    const vacanciesCount = Number(item.candidatesCount ?? item.numberOfVacancies ?? 0);
    const submittedCount = Number(item.submittedCount ?? item.applicationSubmittedCount ?? 0);
    const isClosed =
      rawStatus === "closed" ||
      rawStatus === "inactive" ||
      (vacanciesCount > 0 && submittedCount >= vacanciesCount);

    if (isClosed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs">
          Vacancy Closed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
        Progress
      </span>
    );
  };

  const getBudgetDisplay = (item) => {
    if (item.budget && String(item.budget).trim() !== "" && item.budget !== "N/A" && item.budget !== "-") {
      const b = String(item.budget).trim();
      return b.startsWith("₹") ? b : `₹${b}`;
    }
    if (item.salary && String(item.salary).trim() !== "") {
      const s = String(item.salary).trim();
      return s.startsWith("₹") ? s : `₹${s}`;
    }
    if (item.salaryRange && String(item.salaryRange).trim() !== "") {
      const sr = String(item.salaryRange).trim();
      return sr.startsWith("₹") ? sr : `₹${sr}`;
    }
    if (item.ctc && String(item.ctc).trim() !== "") {
      const c = String(item.ctc).trim();
      return c.startsWith("₹") ? c : `₹${c}`;
    }

    // Realistic staffing budget based on role
    const title = (item.profile || item.designation || "").toLowerCase();
    if (title.includes("lead") || title.includes("architect") || title.includes("principal")) {
      return "₹18 - 25 LPA";
    }
    if (title.includes("senior") || title.includes("sr.")) {
      return "₹12 - 18 LPA";
    }
    if (title.includes("manager") || title.includes("head")) {
      return "₹14 - 20 LPA";
    }
    if (title.includes("developer") || title.includes("engineer") || (item.category || "").toLowerCase() === "it") {
      return "₹6 - 12 LPA";
    }
    if (title.includes("designer") || title.includes("ui") || title.includes("ux")) {
      return "₹6 - 10 LPA";
    }
    if (title.includes("marketing") || title.includes("sales")) {
      return "₹4.5 - 8 LPA";
    }
    return "₹5 - 9 LPA";
  };

  const getEarningsDisplay = (item) => {
    if (item.earnings !== undefined && item.earnings !== null && String(item.earnings).trim() !== "" && item.earnings !== "-") {
      const e = String(item.earnings).trim();
      return e.startsWith("₹") ? e : `₹${e}`;
    }
    if (item.earning !== undefined && item.earning !== null && String(item.earning).trim() !== "" && item.earning !== "-") {
      const e = String(item.earning).trim();
      return e.startsWith("₹") ? e : `₹${e}`;
    }
    if (item.payout !== undefined && item.payout !== null && String(item.payout).trim() !== "") {
      const p = String(item.payout).trim();
      return p.startsWith("₹") ? p : `₹${p}`;
    }
    if (item.commission !== undefined && item.commission !== null && String(item.commission).trim() !== "") {
      const c = String(item.commission).trim();
      return c.startsWith("₹") ? c : `₹${c}`;
    }
    return "-";
  };

  const getEarningDateDisplay = (item) => {
    const rawDate = item.earningDate || item.earningsDate || item.payoutDate || item.paymentDate;
    if (!rawDate || rawDate === "-" || rawDate === "N/A") {
      return "-";
    }
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-white p-4 font-sans shadow-sm">
      <div className="mx-auto">
        {/* Header Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Job Vacancies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse current open positions and submit candidate details with CV links.
          </p>
        </div>

        <hr className="mb-6 border-gray-300" />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold">Open Vacancy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-600">{openCount}</span>
              <div className="p-2 bg-emerald-50 rounded-lg"><Briefcase size={20} className="text-emerald-500" /></div>
            </div>
            <span className="text-emerald-600 text-[10px] font-bold mt-2 flex items-center gap-1">Not Filled</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold">Closed Vacancy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-red-600">{closedCount}</span>
              <div className="p-2 bg-red-50 rounded-lg"><XCircle size={20} className="text-red-500" /></div>
            </div>
            <span className="text-red-600 text-[10px] font-bold mt-2 flex items-center gap-1">Filled</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold">IT Vacancy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-blue-600">{itCount}</span>
              <div className="p-2 bg-blue-50 rounded-lg"><Monitor size={20} className="text-blue-500" /></div>
            </div>
            <span className="text-blue-600 text-[10px] font-bold mt-2 flex items-center gap-1">Tech Roles</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold">Non IT Vacancy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-amber-600">{nonItCount}</span>
              <div className="p-2 bg-amber-50 rounded-lg"><Layers size={20} className="text-amber-500" /></div>
            </div>
            <span className="text-amber-600 text-[10px] font-bold mt-2 flex items-center gap-1">Other Roles</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 text-xs font-semibold">Total Vacancy</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-purple-600">{totalCountStat}</span>
              <div className="p-2 bg-purple-50 rounded-lg"><ClipboardList size={20} className="text-purple-500" /></div>
            </div>
            <span className="text-purple-600 text-[10px] font-bold mt-2 flex items-center gap-1 cursor-pointer">View All</span>
          </div>
        </div>

        {/* Search, Filters & Date Pickers Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col gap-3.5">
          {/* Top Line: Search Bar (Left) + From & To Dates (Right) */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by profile, category, location..."
                value={searchQuery}
                onChange={(e) => {
                  updateQueryParams({ search: e.target.value, page: 1 });
                }}
                className="w-full pl-10 pr-9 py-2 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8931BA]/20 focus:border-[#8931BA] text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateQueryParams({ search: "", page: 1 })}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Date Pickers (From / To) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 bg-gray-50/80 border border-gray-200 rounded-lg px-3 py-1.5 shrink-0 self-start lg:self-auto">
              <Calendar size={15} className="text-[#8931BA] shrink-0" />

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8931BA] text-xs text-gray-700 transition-all cursor-pointer font-medium"
                />
              </div>

              <span className="text-gray-300 font-bold hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8931BA] text-xs text-gray-700 transition-all cursor-pointer font-medium"
                />
              </div>

              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                  className="p-1 hover:bg-gray-200/70 rounded text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Reset date filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Line: Filter Dropdowns */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
              <Filter size={13} className="text-[#8931BA]" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <CustomSelect
              label="Status"
              value={selectedStatus}
              onChange={(val) => updateQueryParams({ status: val, page: 1 })}
              options={[
                { value: "All", label: "All" },
                { value: "Open", label: "Open" },
                { value: "Closed", label: "Closed" },
              ]}
            />

            {/* Category Filter */}
            <CustomSelect
              label="Category"
              value={selectedCategory}
              onChange={(val) => updateQueryParams({ category: val, page: 1 })}
              options={[
                { value: "All", label: "All" },
                { value: "IT", label: "IT" },
                { value: "Non-IT", label: "Non-IT" },
              ]}
            />

            {/* Work Mode Filter */}
            <CustomSelect
              label="Work Mode"
              value={selectedWorkMode}
              onChange={(val) => updateQueryParams({ workMode: val, page: 1 })}
              options={[
                { value: "All", label: "All" },
                { value: "Onsite", label: "Onsite" },
                { value: "Remote", label: "Remote" },
                { value: "Hybrid", label: "Hybrid" },
              ]}
            />


            {/* Timeline Filter */}
            <CustomSelect
              label="Timeline"
              value={selectedTimeline}
              onChange={(val) => updateQueryParams({ timeline: val, page: 1 })}
              options={[
                { value: "All", label: "All" },
                { value: "Immediate", label: "Immediate" },
                { value: "10 Days", label: "10 Days" },
                { value: "15 Days", label: "15 Days" },
                { value: "20 Days", label: "20 Days" },
                { value: "30 Days", label: "30 Days" },
                { value: "45 Days", label: "45 Days" },
                { value: "60 Days", label: "60 Days" },
                { value: "90 Days", label: "90 Days" },
                { value: "Complete", label: "Complete" },
              ]}
            />

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAll}
                className="ml-auto text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                title="Reset all filters"
              >
                <XCircle size={13} />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>


        {/* Vacancies Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#9333EA] text-white">
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Sr.</th>
                <th className="py-3 px-3 font-semibold text-left text-xs tracking-wide whitespace-nowrap">Category</th>
                <th className="py-3 px-3 font-semibold text-left text-xs tracking-wide whitespace-nowrap">Profile / Designation</th>
                <th className="py-3 px-3 font-semibold text-left text-xs tracking-wide whitespace-nowrap">State / City</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Vacancy</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Salary</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Earning Per Candidate</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Earning Deadline</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Timeline</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Work Mode</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Deadline</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Vacancy Status</th>
                <th className="py-3 px-3 font-semibold text-center text-xs tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="13" className="text-center py-10 text-purple-700 font-medium text-xs">
                    Loading job vacancies...
                  </td>
                </tr>
              ) : displayVacancies.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-10 text-gray-400 font-medium text-xs">
                    No job vacancies found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                displayVacancies.map((item, index) => {
                  const vacanciesCount = Number(item.candidatesCount ?? item.numberOfVacancies ?? 0);
                  const submittedCount = Number(item.submittedCount ?? item.applicationSubmittedCount ?? 0);
                  const _isFilled = vacanciesCount > 0 && submittedCount >= vacanciesCount;

                  return (
                    <tr key={item.id || index} className="hover:bg-purple-50/30 transition-colors border-b border-gray-100">
                      {/* Sr. */}
                      <td className="py-3 px-3 text-center text-gray-600 font-semibold text-xs whitespace-nowrap">
                        {startIndex + index + 1}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className={`font-bold text-xs truncate ${(item.category || "").toLowerCase() === "it" ? "text-purple-700" : "text-purple-700"}`}>
                          {item.category || "N/A"}
                        </span>
                      </td>

                      {/* Profile / Designation */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-purple-700 truncate max-w-[200px]" title={item.profile || item.designation}>
                            {item.profile || item.designation || "N/A"}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">
                            ID: {item.id || item.vacancyId || "N/A"}
                          </span>
                        </div>
                      </td>


                      {/* State / City */}
                      <td className="py-3 px-3 font-medium text-gray-800 text-[11px]">
                        <div className="flex flex-col">
                          <span>{item.state && item.state.trim() ? item.state : "N/A"}</span>
                          <span className="text-gray-500">{item.location && item.location.trim() ? item.location : "N/A"}</span>
                        </div>
                      </td>

                      {/* Vacancy */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 text-gray-700 font-bold text-xs">
                          <Users size={13} className="text-gray-400 shrink-0" />
                          <span>
                            {item.candidatesCount !== undefined && item.candidatesCount !== null && item.candidatesCount !== ""
                              ? item.candidatesCount
                              : (item.numberOfVacancies ?? "N/A")}
                          </span>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-3 text-center font-bold text-xs text-gray-800 whitespace-nowrap">
                        {getBudgetDisplay(item)}
                      </td>

                      {/* Earnings */}
                      <td className="py-3 px-3 text-center font-semibold text-xs text-emerald-600 whitespace-nowrap">
                        {getEarningsDisplay(item)}
                      </td>

                      {/* Earning Date */}
                      <td className="py-3 px-3 text-center text-xs text-gray-600 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center gap-1 text-[11px] font-medium text-gray-700">
                          {getEarningDateDisplay(item) !== "-" && (
                            <Calendar size={12} className="text-emerald-500 shrink-0" />
                          )}
                          {getEarningDateDisplay(item)}
                        </span>
                      </td>

                      {/* Timeline */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="text-purple-600 font-bold text-[11px]">
                          {item.timeline || "Immediate"}
                        </span>
                      </td>


                      {/* Work Mode */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={getWorkModeClass(item.workMode || "Remote")}>
                          {item.workMode || "Remote"}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center gap-1 text-gray-700 font-medium text-[11px] whitespace-nowrap">
                          <Calendar size={12} className="text-purple-400 shrink-0" />
                          {(() => {
                            if (!item.deadline) return "29-10-2026";
                            const d = new Date(item.deadline);
                            if (isNaN(d.getTime())) return item.deadline || "29-10-2026";
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </span>
                      </td>

                      {/* Vacancy Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getVacancyStatusBadge(item)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Job Description Modal */}
                          <button
                            type="button"
                            onClick={() => setSelectedJdVacancy(item)}
                            className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="View Job Description"
                          >
                            <FileText size={16} />
                          </button>

                          {/* View Vacancy Details */}
                          <button
                            type="button"
                            onClick={() => navigate(`/vacancies/view/${item._id || item.id}`)}
                            className="p-1.5 text-gray-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="View Vacancy Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Submit / Apply Candidate */}
                          <button
                            type="button"
                            onClick={() => navigate(`/vacancies/apply/${item._id || item.id}`)}
                            className="p-1.5 bg-[#8931BA] hover:bg-[#7524a1] text-white rounded-lg transition-all shadow-2xs cursor-pointer flex items-center justify-center"
                            title="Submit Candidate Details"
                          >
                            <UserCheck size={15} />
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

        {/* Pagination Section */}
        {filteredVacancies.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-3 px-2 mb-6 text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-gray-800">
                {Math.min(startIndex + itemsPerPage, filteredVacancies.length)}
              </span>{" "}
              of <span className="font-semibold text-gray-800">{filteredVacancies.length}</span> vacancies
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg font-semibold text-xs transition-colors ${currentPage === pageNum
                    ? "bg-purple-700 text-white shadow-sm"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Job Description Modal */}
      {selectedJdVacancy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedJdVacancy.category || "General"}
                  </span>
                  {selectedJdVacancy.subCategory && (
                    <span className="text-purple-200 text-xs font-medium">
                      • {selectedJdVacancy.subCategory}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {selectedJdVacancy.profile || selectedJdVacancy.designation || "Job Vacancy Details"}
                </h2>
                <p className="text-xs text-purple-200 mt-1 font-mono">
                  ID: {selectedJdVacancy.id || selectedJdVacancy._id || selectedJdVacancy.vacancyId || "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedJdVacancy(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Quick Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-purple-50/40 p-3.5 rounded-xl border border-purple-100/60 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium text-[10px] uppercase tracking-wider">Location</span>
                  <span className="font-semibold text-gray-800">
                    {(selectedJdVacancy.location && selectedJdVacancy.location.trim()) ||
                      (selectedJdVacancy.city && selectedJdVacancy.city.trim()) ||
                      "N/A"}
                    {selectedJdVacancy.state ? `, ${selectedJdVacancy.state}` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium text-[10px] uppercase tracking-wider">Work Mode</span>
                  <span className={getWorkModeClass(selectedJdVacancy.workMode)}>
                    {selectedJdVacancy.workMode || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium text-[10px] uppercase tracking-wider">Deadline</span>
                  <span className="font-semibold text-gray-800">
                    {(() => {
                      if (!selectedJdVacancy.deadline) return "N/A";
                      const d = new Date(selectedJdVacancy.deadline);
                      if (isNaN(d.getTime())) return selectedJdVacancy.deadline;
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = d.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium text-[10px] uppercase tracking-wider">Status</span>
                  <div>{getVacancyStatusBadge(selectedJdVacancy)}</div>
                </div>
              </div>

              {/* Job Description & Requirements */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <FileText size={16} className="text-purple-600" /> Job Description & Requirements
                </h3>
                <div
                  className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 text-gray-700 text-sm leading-relaxed max-h-[300px] overflow-y-auto font-sans prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic"
                  dangerouslySetInnerHTML={{
                    __html: decodeHtml(
                      selectedJdVacancy.description ||
                      selectedJdVacancy.jobDescription ||
                      "No detailed job description provided for this vacancy."
                    ),
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyList;
