import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { State, City } from "country-state-city";
import { ArrowLeft, Send, Link as LinkIcon, Briefcase, MapPin, Calendar, User, Search, ChevronDown, Building2 } from "lucide-react";
import { fetchSingleVacancy, submitCandidateApplicationApi } from "../../redux/slice/vacancy/vacancySlice";

// Fetch all Indian states dynamically from country-state-city package (Country code: 'IN')
const INDIAN_STATES = State.getStatesOfCountry("IN");

const CandidateApplySchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email address").required("Email address is required"),
  phone: Yup.string().required("Phone number is required"),
  totalExperience: Yup.string(),
  currentOrganization: Yup.string(),
  currentCTC: Yup.string(),
  expectedCTC: Yup.string(),
  noticePeriod: Yup.string(),
  state: Yup.string(),
  city: Yup.string(),
  referredBy: Yup.string(),
  resumeLink: Yup.string().url("Must be a valid URL (e.g. https://drive.google.com/...)"),
  recruiterNotes: Yup.string(),
});

// Custom Searchable Dropdown Component
const SearchableSelect = ({ label, placeholder, options, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.name === value);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 flex items-center justify-between transition-all shadow-2xs ${
          disabled ? "bg-gray-100/80 text-gray-400 cursor-not-allowed" : "cursor-pointer focus:ring-2 focus:ring-purple-500"
        }`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent text-gray-800 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48 divide-y divide-gray-50">
            <div
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="p-2.5 text-xs text-gray-500 hover:bg-purple-50 hover:text-purple-700 cursor-pointer font-medium"
            >
              Clear Selection
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.isoCode || opt.name}
                  onClick={() => {
                    onChange(opt.name);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`p-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer font-medium flex items-center justify-between ${
                    value === opt.name ? "bg-purple-50 text-purple-700 font-semibold" : ""
                  }`}
                >
                  <span>{opt.name}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-gray-400 text-center">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ApplyCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { vacancies, currentVacancy } = useSelector((state) => state.vacancy);

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleVacancy(id));
    }
  }, [dispatch, id]);

  const targetVacancy =
    (currentVacancy && (currentVacancy.id === id || currentVacancy._id === id || currentVacancy.vacancyId === id))
      ? currentVacancy
      : vacancies.find((v) => v.id === id || v._id === id || v.vacancyId === id) || currentVacancy || vacancies[0];

  const vacancyTitle = targetVacancy?.designation || targetVacancy?.profile || "Senior React Developer";
  const vacancyCategory = targetVacancy?.category || targetVacancy?.department || "IT";
  const vacancySubCategory = targetVacancy?.subCategory || targetVacancy?.subDepartment || "Frontend Development";
  const vacancyLocation = targetVacancy?.city 
    ? (targetVacancy?.state ? `${targetVacancy.city}, ${targetVacancy.state}` : targetVacancy.city)
    : (targetVacancy?.location || "Mumbai, Maharashtra");
  const vacancyWorkMode = targetVacancy?.workMode || targetVacancy?.jobType || "Remote";
  const rawDeadline = targetVacancy?.deadline || "2026-10-15";
  const formattedDeadline = typeof rawDeadline === "string" ? rawDeadline.split("T")[0] : rawDeadline;

  const handleSubmit = async (values, { setSubmitting }) => {
    const vacancyTargetId = targetVacancy?._id || targetVacancy?.vacancyId || targetVacancy?.id || id;
    
    const resultAction = await dispatch(
      submitCandidateApplicationApi({
        id: vacancyTargetId,
        payload: values,
      })
    );
    setSubmitting(false);

    if (submitCandidateApplicationApi.fulfilled.match(resultAction)) {
      navigate("/vacancies");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Navigation */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/vacancies")}
            className="w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Vacancies"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submit Candidate Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Apply for position: <span className="font-semibold text-purple-700">{vacancyTitle}</span>
            </p>
          </div>
        </div>

        {/* Target Vacancy Card Banner */}
        <div className="bg-purple-50/60 border border-purple-150 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                TARGET VACANCY
              </span>
              <h2 className="text-xl font-bold text-purple-950">
                {vacancyTitle}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {vacancyCategory} • {vacancySubCategory}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white border border-purple-100 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-purple-900 flex items-center gap-1.5 shadow-2xs">
                <Building2 size={14} className="text-purple-600" />
                <span>Hiring: <strong>{targetVacancy?.hiring || "Internal"}</strong></span>
              </div>
              <div className="bg-white border border-purple-100 px-3.5 py-1.5 rounded-xl text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-2xs">
                <MapPin size={14} className="text-purple-600" />
                <span>{vacancyLocation}</span>
              </div>
              <div className="bg-white border border-purple-100 px-3.5 py-1.5 rounded-xl text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-2xs">
                <Briefcase size={14} className="text-purple-600" />
                <span>{vacancyWorkMode}</span>
              </div>
              <div className="bg-white border border-purple-100 px-3.5 py-1.5 rounded-xl text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-2xs">
                <Calendar size={14} className="text-purple-600" />
                <span>Deadline: {formattedDeadline}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200/80 my-6"></div>

        {/* Main Candidate Application Form Card */}
        <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200/60 mb-6">
            <User size={18} className="text-purple-600" />
            <h3 className="text-base font-bold text-gray-800">
              Candidate Personal & Professional Details
            </h3>
          </div>

          <Formik
            initialValues={{
              fullName: "",
              phone: "",
              email: "",
              state: "",
              city: "",
              currentOrganization: "",
              totalExperience: "",
              currentCTC: "",
              expectedCTC: "",
              noticePeriod: "Immediate Joiner",
              resumeLink: "",
              recruiterNotes: "",
              referredBy: "",
            }}
            validationSchema={CandidateApplySchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => {
              const selectedStateObj = INDIAN_STATES.find(
                (st) => st.name === values.state || st.isoCode === values.state
              );
              const availableCities = selectedStateObj
                ? City.getCitiesOfState("IN", selectedStateObj.isoCode)
                : [];

              return (
                <Form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 1. Full Name * */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="fullName"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                      <ErrorMessage name="fullName" component="div" className="text-rose-500 text-xs mt-1 font-medium" />
                    </div>

                    {/* 2. Phone Number * */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="phone"
                        placeholder="e.g. +91 9876543210"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                      <ErrorMessage name="phone" component="div" className="text-rose-500 text-xs mt-1 font-medium" />
                    </div>

                    {/* 3. Email Address * */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <Field
                        type="email"
                        name="email"
                        placeholder="e.g. rahul.sharma@example.com"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                      <ErrorMessage name="email" component="div" className="text-rose-500 text-xs mt-1 font-medium" />
                    </div>

                    {/* 4. State (Searchable) */}
                    <SearchableSelect
                      label="State"
                      placeholder="Select State"
                      options={INDIAN_STATES}
                      value={values.state}
                      onChange={(selectedSt) => {
                        setFieldValue("state", selectedSt);
                        setFieldValue("city", "");
                      }}
                    />

                    {/* 5. City (Searchable) */}
                    <SearchableSelect
                      label="City"
                      placeholder={values.state ? "Select City" : "First Select a State"}
                      options={availableCities}
                      value={values.city}
                      disabled={!values.state}
                      onChange={(selectedCity) => {
                        setFieldValue("city", selectedCity);
                      }}
                    />

                    {/* 6. Current / Last Organization */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Current / Last Organization
                      </label>
                      <Field
                        type="text"
                        name="currentOrganization"
                        placeholder="e.g. Tech Solutions Pvt Ltd"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                    </div>

                    {/* 7. Total Experience (Years) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Total Experience (Years)
                      </label>
                      <Field
                        type="text"
                        name="totalExperience"
                        placeholder="e.g. 3.5"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                    </div>

                    {/* 8. Current CTC */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Current CTC
                      </label>
                      <Field
                        type="text"
                        name="currentCTC"
                        placeholder="e.g. ₹ 8 LPA"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                    </div>

                    {/* 9. Expected CTC / Salary */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Expected CTC / Salary
                      </label>
                      <Field
                        type="text"
                        name="expectedCTC"
                        placeholder="e.g. ₹ 12 LPA"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                      />
                    </div>

                    {/* 10. Notice Period */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Notice Period
                      </label>
                      <Field
                        as="select"
                        name="noticePeriod"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="Immediate Joiner">Immediate Joiner</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="45 Days">45 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </Field>
                    </div>
                  </div>

                  {/* 11. Google Drive CV / Resume Link */}
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <LinkIcon size={16} className="text-purple-600" />
                      Google Drive CV / Resume Link
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Paste a shared Google Drive link to the candidate's CV (Make sure access permission is set to "Anyone with the link").
                    </p>
                    <Field
                      type="url"
                      name="resumeLink"
                      placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                    />
                    <ErrorMessage name="resumeLink" component="div" className="text-rose-500 text-xs mt-1 font-medium" />
                  </div>

                  {/* 12. Recruiter Notes / Comments */}
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Recruiter Notes / Comments
                    </label>
                    <Field
                      as="textarea"
                      name="recruiterNotes"
                      rows="3"
                      placeholder="Additional candidate summary or interview notes..."
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>

                  {/* 13. Recruiter Name */}
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Recruiter Name
                    </label>
                    <Field
                      type="text"
                      name="referredBy"
                      placeholder="e.g. Priya Sharma (Senior HR Executive)"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200/70 mt-6">
                    <button
                      type="button"
                      onClick={() => navigate("/vacancies")}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md text-sm cursor-pointer disabled:opacity-50"
                    >
                      <Send size={16} />
                      Submit Application
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>

      </div>
    </div>
  );
};

export default ApplyCandidate;

