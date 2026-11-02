import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Clock,
  UserCheck,
  FileText,
  ExternalLink,
  Calendar,
  Building,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { fetchSingleApplicationDetails } from "../../redux/slice/vacancy/vacancySlice";
import Footer from "../../components/common/Footer";

const SubmittedApplicationDetails = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { applications, vacancies, currentApplication, loading } = useSelector((state) => state.vacancy);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (appId) {
      // appId might be applicationId or mongo _id; vacancyId can be fetched optionally
      dispatch(fetchSingleApplicationDetails({ applicationId: appId }));
    }
  }, [dispatch, appId]);

  const application =
    (currentApplication && (currentApplication.id === appId || currentApplication._id === appId || currentApplication.applicationId === appId))
      ? currentApplication
      : applications.find((app) => app.id === appId || app._id === appId || app.applicationId === appId) || currentApplication;

  const targetVacancy = typeof application?.vacancy === "object"
    ? application.vacancy
    : vacancies.find((v) => v.id === application?.vacancyId || v._id === application?.vacancy || v.vacancyId === application?.vacancyCode);

  const vacancyTitle = application?.vacancyProfile || targetVacancy?.designation || targetVacancy?.profile || application?.vacancyCode || "N/A";
  const vacancyCategory = targetVacancy?.category || targetVacancy?.department || "IT";
  const vacancySubCategory = targetVacancy?.subCategory || targetVacancy?.subDepartment || "Development";

  const fullName = application?.fullName || "Candidate";
  const email = application?.email;
  const phone = application?.phone;
  const totalExperience = application?.totalExperience || application?.experience;
  const currentCompany = application?.currentOrganization || application?.currentCompany;
  const currentCTC = application?.currentCTC || application?.currentCtc;
  const expectedCTC = application?.expectedCTC || application?.expectedSalary;
  const noticePeriod = application?.noticePeriod || "Immediate Joiner";
  const location = application?.city 
    ? (application?.state ? `${application.city}, ${application.state}` : application.city)
    : (application?.location || targetVacancy?.location || "N/A");
  const referredBy = application?.referredBy || application?.referredByHr || "Direct Application";
  const cvLink = application?.resumeLink || application?.cvDriveLink;
  const recruiterNotes = application?.recruiterNotes || application?.coverNote;
  const rejectionReason = application?.rejectionReason;
  const displayStatus = application?.displayStatus || application?.statusLabel || application?.status || "Submitted";
  const reviewedAt = application?.reviewedAt;
  const submittedByHr = application?.submittedBy?.hrName || application?.submittedBy?.email;

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = formatDateToDDMMYYYY(application?.createdAt || application?.submittedAt);
  const formattedReviewedDate = reviewedAt ? formatDateToDDMMYYYY(reviewedAt) : null;

  if (!application && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-between font-sans">
        <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200 px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            The requested candidate application (ID: {appId}) could not be found or has been removed.
          </p>
          <button
            onClick={() => navigate("/vacancies")}
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Vacancies
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 md:p-8 font-sans flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Navigation & Status Bar */}
        <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                application?.vacancyId || application?.vacancyCode
                  ? navigate(`/vacancies/view/${application.vacancyId || application.vacancyCode}`)
                  : navigate("/vacancies")
              }
              className="p-3 bg-purple-50 hover:bg-purple-100 text-[#8931BA] rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border border-purple-200"
              title="Back to applications"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#8931BA] uppercase tracking-wider">Candidate Profile</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-50 text-purple-900 rounded-md border border-purple-200 flex items-center gap-1.5">
                  #{application?.applicationId || application?.id || appId}
                  <button
                    onClick={() => handleCopy(application?.applicationId || application?.id || appId, "appId")}
                    className="hover:text-[#8931BA] transition-colors cursor-pointer"
                    title="Copy ID"
                  >
                    {copiedField === "appId" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <Calendar size={14} className="text-purple-600" />
                  Applied {formattedDate}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-1 flex items-center gap-3">
                {fullName}
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    application?.isAccepted || displayStatus?.toLowerCase() === "accepted" || displayStatus?.toLowerCase() === "shortlisted"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : application?.isRejected || displayStatus?.toLowerCase() === "rejected"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : application?.isOnHold || displayStatus?.toLowerCase() === "on hold"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-purple-100 text-purple-900 border-purple-300"
                  }`}
                >
                  {displayStatus}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {cvLink && (
              <a
                href={cvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#8931BA] hover:bg-[#7726a5] text-white font-bold text-sm rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <FileText size={18} />
                View CV / Resume
                <ExternalLink size={14} className="opacity-90" />
              </a>
            )}
          </div>
        </div>

        {/* Main Banner Card */}
        <div className="bg-gradient-to-r from-[#5a1b7e] via-[#8931BA] to-[#4a126b] text-white rounded-2xl p-6 md:p-8 shadow-lg border border-purple-800 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white text-[#8931BA] flex items-center justify-center font-black text-3xl shadow-md border-2 border-purple-200 shrink-0">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-100 font-bold text-base">
                  <Briefcase size={18} className="text-purple-200" />
                  <span>Target Role: <strong className="text-white text-lg font-extrabold">{vacancyTitle}</strong></span>
                </div>
                <div className="flex items-center gap-4 text-sm text-purple-100 font-medium flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Building size={16} className="text-purple-200" />
                    {vacancyCategory} • {vacancySubCategory}
                  </span>
                  <span className="text-purple-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-purple-200" />
                    {location}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-3 flex-wrap border-t md:border-t-0 pt-4 md:pt-0 border-purple-700/50">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Phone size={15} className="text-purple-200" /> {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Mail size={15} className="text-purple-200" /> {email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3-Column Detailed Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Contact Details */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 mb-5 border-b border-purple-100">
                <div className="p-2.5 bg-purple-100 text-[#8931BA] rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">Contact Information</h2>
                  <p className="text-xs font-medium text-gray-500">Personal contact details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Full Name</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 block">{fullName}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Email Address</span>
                  {email ? (
                    <div className="flex items-center justify-between group/email mt-1">
                      <a href={`mailto:${email}`} className="text-sm font-bold text-[#8931BA] hover:underline block truncate">
                        {email}
                      </a>
                      <button
                        onClick={() => handleCopy(email, "cardEmail")}
                        className="p-1 text-gray-400 hover:text-[#8931BA] transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedField === "cardEmail" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">N/A</span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Phone Number</span>
                  {phone ? (
                    <div className="flex items-center justify-between group/phone mt-1">
                      <span className="text-sm font-bold text-gray-900">{phone}</span>
                      <button
                        onClick={() => handleCopy(phone, "cardPhone")}
                        className="p-1 text-gray-400 hover:text-[#8931BA] transition-colors cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedField === "cardPhone" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">N/A</span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Location</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 block">{location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Professional Experience */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 mb-5 border-b border-purple-100">
                <div className="p-2.5 bg-purple-100 text-[#8931BA] rounded-xl">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">Professional Experience</h2>
                  <p className="text-xs font-medium text-gray-500">Work history & compensation</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Experience</span>
                    <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                      {totalExperience ? `${totalExperience} Years` : "N/A"}
                    </span>
                  </div>
                  {totalExperience && (
                    <span className="px-2.5 py-1 bg-purple-100 text-[#8931BA] font-extrabold text-xs rounded-lg border border-purple-200">
                      {totalExperience} YRS
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Current Company</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 block">{currentCompany || "N/A"}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase block">Current CTC</span>
                    <span className="text-sm font-extrabold text-gray-900 mt-1 block">{currentCTC || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200">
                    <span className="text-xs font-bold text-[#8931BA] uppercase block">Expected CTC</span>
                    <span className="text-sm font-extrabold text-purple-950 mt-1 block">{expectedCTC || "N/A"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Notice Period</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                    <Clock size={15} className="text-purple-600" />
                    {noticePeriod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Vacancy Context */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 mb-5 border-b border-purple-100">
                <div className="p-2.5 bg-purple-100 text-[#8931BA] rounded-xl">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">Vacancy Context</h2>
                  <p className="text-xs font-medium text-gray-500">Position & submission info</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Target Position</span>
                  <span className="text-sm font-extrabold text-[#8931BA] mt-1 block">{vacancyTitle}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Domain / Sub-Domain</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 block">
                    {vacancyCategory} ({vacancySubCategory})
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Submitted By / Referral</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                    <UserCheck size={15} className="text-purple-600" />
                    {referredBy || submittedByHr || "Direct Application"}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Application Date</span>
                  <span className="text-sm font-bold text-gray-900 mt-1 block">{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review & Decision Card (if reviewed or rejected) */}
        {(rejectionReason || reviewedAt) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rejectionReason && (
              <div className="bg-red-50/70 rounded-2xl p-6 border border-red-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-red-600" />
                  <h2 className="font-extrabold text-red-900 text-base">Rejection Reason</h2>
                </div>
                <div className="p-4 bg-white rounded-xl border border-red-100 text-sm font-semibold text-red-700 leading-relaxed">
                  {rejectionReason}
                </div>
              </div>
            )}
            {reviewedAt && (
              <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-[#8931BA] rounded-xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-gray-900 text-base">Application Reviewed</h2>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      Reviewed on: <strong className="text-[#8931BA]">{formattedReviewedDate}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recruiter Remarks Card */}
        {recruiterNotes && (
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={20} className="text-[#8931BA]" />
              <h2 className="font-extrabold text-gray-900 text-base">Recruiter Remarks / Notes</h2>
            </div>
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 text-sm font-semibold text-gray-800 leading-relaxed">
              {recruiterNotes}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SubmittedApplicationDetails;
