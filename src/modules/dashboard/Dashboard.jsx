import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  ArrowUpRight,
  CalendarDays,
  RotateCcw,
  CalendarRange,
  Calendar
} from "lucide-react";
import { fetchVacancies } from "../../redux/slice/vacancy/vacancySlice";
import { fetchDashboardData } from "../../redux/slice/dashboard/dashboardSlice";
import Footer from "../../components/common/Footer";

// Colors for Pie Chart
const PIE_COLORS = ["#8B5CF6", "#6366F1", "#EC4899", "#14B8A6", "#F59E0B"];

const CARD_COLORS = {
  purple: {
    container: "from-purple-50/90 to-purple-100/40 border-purple-200/80",
    label: "text-purple-700",
    value: "text-purple-950",
    subtext: "text-purple-600/90",
    icon: "from-purple-500 to-purple-700"
  },
  indigo: {
    container: "from-indigo-50/90 to-indigo-100/40 border-indigo-200/80",
    label: "text-indigo-700",
    value: "text-indigo-950",
    subtext: "text-indigo-600/90",
    icon: "from-indigo-500 to-indigo-700"
  },
  fuchsia: {
    container: "from-fuchsia-50/90 to-fuchsia-100/40 border-fuchsia-200/80",
    label: "text-fuchsia-700",
    value: "text-fuchsia-950",
    subtext: "text-fuchsia-600/90",
    icon: "from-fuchsia-500 to-fuchsia-700"
  }
};

function TimeCard({ label, value, icon: Icon, color, subtext }) {
  const theme = CARD_COLORS[color] || CARD_COLORS.purple;
  return (
    <div className={`bg-gradient-to-br ${theme.container} border rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md`}>
      <div>
        <span className={`text-xs font-extrabold ${theme.label} uppercase tracking-wider block`}>{label}</span>
        <span className={`text-3xl font-extrabold ${theme.value} mt-1 block`}>{value}</span>
        <span className={`text-xs font-semibold ${theme.subtext} mt-0.5 block`}>{subtext}</span>
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${theme.icon} text-white rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vacancies, loading: vacancyLoading } = useSelector((state) => state.vacancy);
  const { data: dashboardData, loading: dashboardLoading } = useSelector(
    (state) => state.dashboard || {}
  );

  const loading = vacancyLoading || dashboardLoading;

  useEffect(() => {
    // 1. Fetch live dashboard metrics from /api/outsource/dashboard
    dispatch(fetchDashboardData());

    // 2. Fetch vacancies list with required parameters: page=1&limit=10&search=&category=All&status=All
    dispatch(
      fetchVacancies({
        page: 1,
        limit: 10,
        search: "",
        category: "All",
        status: "All",
      })
    );
  }, [dispatch]);

  // 1. Requirements Analytics (Time Cards)
  const timeMetrics = useMemo(() => {
    const analytics = dashboardData?.requirementsAnalytics;
    if (analytics) {
      return {
        todayCount: analytics.today ?? 0,
        yesterdayCount: analytics.yesterday ?? 0,
        weekCount: analytics.thisWeek ?? 0,
        monthCount: analytics.thisMonth ?? 0,
      };
    }

    if (dashboardData) {
      return {
        todayCount: dashboardData.todayCount ?? dashboardData.today ?? 0,
        yesterdayCount: dashboardData.yesterdayCount ?? dashboardData.yesterday ?? 0,
        weekCount: dashboardData.thisWeek ?? dashboardData.weekCount ?? 0,
        monthCount: dashboardData.thisMonth ?? dashboardData.monthCount ?? 0,
      };
    }

    return { todayCount: 0, yesterdayCount: 0, weekCount: 0, monthCount: 0 };
  }, [dashboardData]);

  // 2. Chart Data: Top Submissions per Vacancy (Bar Chart)
  const barData = useMemo(() => {
    const list = dashboardData?.topSubmissionsByVacancy;
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item) => ({
        name: (item.title || item.vacancyId || "Role").substring(0, 12),
        fullName: item.title || item.vacancyId || "",
        Submissions: item.count ?? 0,
      }));
    }

    // Fallback: Compute from active vacancies list
    return [...(vacancies || [])]
      .sort((a, b) => (b.submittedCount || 0) - (a.submittedCount || 0))
      .slice(0, 5)
      .map((v) => ({
        name: (v.profile || v.designation || "Role").substring(0, 10) + "...",
        fullName: v.profile || v.designation || "",
        Submissions: v.submittedCount || 0,
      }));
  }, [dashboardData, vacancies]);

  // 3. Chart Data: Client Vacancies by Sector (Pie Chart)
  const pieData = useMemo(() => {
    const sectors = dashboardData?.vacanciesBySector;
    if (Array.isArray(sectors) && sectors.length > 0) {
      return sectors.map((item) => ({
        name: item.sector || "Other",
        value: Number(item.count) || 0,
      }));
    }

    const categoryCounts = (vacancies || []).reduce((acc, v) => {
      const cat = v.category || v.sector || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(categoryCounts).map((key) => ({
      name: key || "Other",
      value: categoryCounts[key],
    }));
  }, [dashboardData, vacancies]);

  // 4. Recent Requirements List
  const recentList = useMemo(() => {
    const recent = dashboardData?.recentVacancies;
    if (Array.isArray(recent) && recent.length > 0) {
      return recent;
    }
    return (vacancies || []).slice(0, 5).map((v) => ({
      _id: v._id || v.id,
      title: v.profile || v.designation || v.title,
      sector: v.category || v.sector,
      city: v.city || v.location,
      status: v.status || "Active",
      joiningType: v.timeline || "Immediate",
    }));
  }, [dashboardData, vacancies]);

  return (
    <div className="min-h-full bg-gradient-to-br from-[#F8F9FF] to-[#F5F3FF] font-sans rounded-2xl overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 p-5 sm:p-8 rounded-2xl md:rounded-[2rem] border border-white shadow-sm backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2 sm:mb-3 tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Outsource Management
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium">Real-time requirements arriving from the Admin Panel.</p>
          </div>
        </div>


        {/* Vacancy Analytics Overview Section (Time based) */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-700 shadow-sm border border-purple-200">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Requirements Analytics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <TimeCard
              label="TODAY"
              value={loading ? "-" : timeMetrics.todayCount}
              icon={Calendar}
              color="purple"
              subtext="New Vacancies Today"
            />
            <TimeCard
              label="YESTERDAY"
              value={loading ? "-" : timeMetrics.yesterdayCount}
              icon={Calendar}
              color="indigo"
              subtext="Vacancies Yesterday"
            />
            <TimeCard
              label="IN WEEK"
              value={loading ? "-" : timeMetrics.weekCount}
              icon={Calendar}
              color="fuchsia"
              subtext="New This Week"
            />
            <TimeCard
              label="IN MONTH"
              value={loading ? "-" : timeMetrics.monthCount}
              icon={Calendar}
              color="purple"
              subtext="New This Month"
            />
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-900/5 border border-white">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" /> Top Submissions by Vacancy
            </h2>
            <div className="h-[300px] w-full min-h-[300px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      formatter={(val, name, props) => [val, props.payload.fullName || name]}
                    />
                    <Bar dataKey="Submissions" fill="url(#colorIndigo)" radius={[6, 6, 0, 0]} barSize={40} />
                    <defs>
                      <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No submission data available</div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-purple-900/5 border border-white">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
              <Building2 className="text-purple-500" /> Client Vacancies by Sector
            </h2>
            <div className="h-[300px] w-full min-h-[300px] flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No sector data available</div>
              )}
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Openings List */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-900/5 border border-white overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Recent Client Requirements</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Latest vacancies posted from the admin portal.</p>
            </div>
            <button onClick={() => navigate("/vacancies")} className="text-indigo-600 font-bold hover:text-indigo-800 text-sm flex items-center gap-1 transition-colors">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-2 sm:p-3">
            {recentList.slice(0, 5).map((vac) => (
              <div 
                key={vac._id || vac.id || vac.title} 
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6 hover:bg-indigo-50/50 rounded-2xl transition-colors cursor-pointer border-b border-gray-50 last:border-0" 
                onClick={() => navigate(vac._id ? `/vacancies/view/${vac._id}` : "/vacancies")}
              >
                <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl group-hover:scale-105 transition-transform shrink-0">
                    {(vac.title || vac.profile || "V").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                      {vac.title || vac.profile || "Vacancy"}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1 truncate">
                      {vac.sector || vac.category || "IT"} • {vac.city || "Location"}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pl-14 sm:pl-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={13} /> {vac.status || "Active"}
                  </span>
                  <p className="text-xs text-gray-400 sm:mt-2 font-medium flex items-center gap-1">
                    <Clock size={12} /> {vac.joiningType || vac.timeline || "Immediate"}
                  </p>
                </div>
              </div>
            ))}
            {recentList.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500 font-medium">No recent vacancies found.</div>
            )}
          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}