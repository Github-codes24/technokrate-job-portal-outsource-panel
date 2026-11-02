import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, PlusCircle, CheckCircle } from "lucide-react";
import { addVacancy } from "../../redux/slice/vacancy/vacancySlice";

const PostVacancySchema = Yup.object().shape({
  profile: Yup.string().required("Profile / Designation is required"),
  category: Yup.string().required("Category is required"),
  subCategory: Yup.string().required("Sub-category is required"),
  state: Yup.string().required("State is required"),
  location: Yup.string().required("Location is required"),
  candidatesCount: Yup.number()
    .min(1, "At least 1 candidate required")
    .required("Number of candidates is required"),
  workMode: Yup.string()
    .oneOf(["Remote", "Onsite", "Hybrid"], "Select a valid work mode")
    .required("Work mode is required"),
  hiring: Yup.string()
    .oneOf(["Internal", "External"], "Select a valid hiring type")
    .required("Hiring type is required"),
  deadline: Yup.date().required("Deadline date is required"),
  description: Yup.string().required("Job description is required"),
});

const PostVacancy = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(addVacancy(values));
    setSubmitting(false);
    alert("Vacancy posted successfully!");
    navigate("/vacancies");
  };

  return (
    <div className="min-h-screen bg-white p-4 font-sans shadow-sm">
      <div className="mx-auto max-w-4xl">
        {/* Back Button & Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/vacancies")}
            className="p-2 bg-gray-100 hover:bg-purple-100 text-purple-700 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Post New Vacancy</h1>
            <p className="text-sm text-gray-500">Fill in the details to publish a job vacancy for candidates.</p>
          </div>
        </div>

        <hr className="mb-6 border-gray-300" />

        {/* Form Container */}
        <div className="bg-gray-50 border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm mb-6">
          <Formik
            initialValues={{
              profile: "",
              category: "",
              subCategory: "",
              state: "",
              location: "",
              candidatesCount: 1,
              workMode: "Remote",
              hiring: "Internal",
              deadline: "",
              description: "",
            }}
            validationSchema={PostVacancySchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Profile / Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Profile<span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="profile"
                      placeholder="e.g. Senior React Developer"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="profile" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="category"
                      placeholder="e.g. Software & IT"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="category" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Sub Category <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="subCategory"
                      placeholder="e.g. Frontend Development"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="subCategory" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="state"
                      placeholder="e.g. Maharashtra"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="state" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="text"
                      name="location"
                      placeholder="e.g. Mumbai"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="location" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Number of Candidates */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Number of Candidates Required <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="number"
                      name="candidatesCount"
                      min="1"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="candidatesCount" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Work Mode (Dropdown) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Work Mode <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="workMode"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                    </Field>
                    <ErrorMessage name="workMode" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Hiring Type (Dropdown) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Hiring Type <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="hiring"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                    </Field>
                    <ErrorMessage name="hiring" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Application Deadline <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="date"
                      name="deadline"
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="deadline" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Job Description & Requirements <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows="4"
                    placeholder="Provide details about the role, required experience, tech stack..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/vacancies")}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md"
                  >
                    <CheckCircle size={18} />
                    Publish Vacancy
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

      </div>
    </div>
  );
};

export default PostVacancy;
