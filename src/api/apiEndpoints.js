export const API_ENDPOINTS = {
  // Outsource Authentication
  AUTH: {
    SIGNUP: "/api/outsource/auth/signup",
    LOGIN: "/api/outsource/auth/login",
    REQUEST_OTP: "/api/outsource/auth/request-otp",
    VERIFY_OTP: "/api/outsource/auth/verify-otp",
    FORGOT_PASSWORD: "/api/outsource/auth/forgot-password",
    RESET_PASSWORD: "/api/outsource/auth/reset-password",
    LOGOUT: "/api/outsource/auth/logout",
  },
  // Profile
  PROFILE: {
    GET: "/api/outsource/profile",
    UPDATE: "/api/outsource/profile",
  },
  // Dashboard
  DASHBOARD: {
    GET: "/api/outsource/dashboard",
  },
  // Vacancies
  VACANCIES: {
    LIST: "/api/outsource/vacancies",
    ADMIN_APPROVED_LIST: "/api/admin/outsource/vacancies",
    STATS: "/api/outsource/vacancies/stats",
    DETAILS: (id) => `/api/outsource/vacancies/${id}`,
    APPLY: (id) => `/api/outsource/vacancies/apply/${id}`,
    APPLICATIONS: (id) => `/api/outsource/vacancies/${id}/applications`,
    APPLICATION_DETAILS: (applicationId, vacancyId) =>
      vacancyId
        ? `/api/outsource/vacancies/${vacancyId}/applications/${applicationId}`
        : `/api/outsource/vacancies/applications/${applicationId}`,
  },
  // Candidate Database
  CANDIDATE_DATABASE: {
    DROPDOWN_CATEGORIES: "/api/outsource/candidate-database/dropdown/categories",
    DROPDOWN_SUBCATEGORIES: (categoryId) =>
      `/api/outsource/candidate-database/dropdown/subcategories/${categoryId}`,
    DROPDOWN_DESIGNATIONS: (subcategoryId) =>
      `/api/outsource/candidate-database/dropdown/designations/${subcategoryId}`,
    LIST: "/api/outsource/candidate-database",
    UPLOAD: "/api/outsource/candidate-database",
    DETAILS: (id) => `/api/outsource/candidate-database/${id}`,
    UPDATE: (id) => `/api/outsource/candidate-database/${id}`,
    DELETE: (id) => `/api/outsource/candidate-database/${id}`,
    DOWNLOAD: (id) => `/api/outsource/candidate-database/${id}/download`,
  },
  // Daily Activity Dropdowns
  DAILY_ACTIVITY: {
    DROPDOWN_CATEGORIES: "/api/outsource/daily-activity/dropdowns/categories",
    DROPDOWN_SUBCATEGORIES: (categoryId) =>
      `/api/outsource/daily-activity/dropdowns/subcategories/${categoryId}`,
    DROPDOWN_DESIGNATIONS: (subcategoryId) =>
      `/api/outsource/daily-activity/dropdowns/designations/${subcategoryId}`,
    CREATE: "/api/outsource/daily-activity",
    LIST: "/api/outsource/daily-activity",
    DETAILS: (id) => `/api/outsource/daily-activity/${id}`,
    UPDATE: (id) => `/api/outsource/daily-activity/${id}`,
    DELETE: (id) => `/api/outsource/daily-activity/${id}`,
    BLOCK: (id) => `/api/outsource/daily-activity/${id}/block`,
  },
  // Location
  LOCATION: {
    STATES: "/api/location/states",
    CITIES: (stateName) => `/api/location/cities/${encodeURIComponent(stateName)}`,
  },
  // Candidates
  CANDIDATES: {
    DATABASE: "/api/outsource/candidates",
    UPLOAD: "/api/outsource/candidates/upload",
  },
};
