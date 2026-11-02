// import { Routes, Route, Navigate } from "react-router-dom";
// import PublicRoutes from "./PublicRoutes";
// import ProtectedRoutes from "./ProtectedRoutes";

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {PublicRoutes()}
//       {ProtectedRoutes()}

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// };

// export default AppRoutes;






import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import { useSelector } from "react-redux";

import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../modules/dashboard/Dashboard";
import Settings from "../modules/Settings/Settings";
import VacancyList from "../modules/vacancy/VacancyList";
import PostVacancy from "../modules/vacancy/PostVacancy";
import ApplyCandidate from "../modules/vacancy/ApplyCandidate";
import ViewSubmittedApplications from "../modules/vacancy/ViewSubmittedApplications";
import SubmittedApplicationDetails from "../modules/vacancy/SubmittedApplicationDetails";
import Profile from "../modules/profile/Profile";
import Notification from "../modules/notification/Notification";
import DailyActivity from "../modules/activity/DailyActivity";
import AddWorkReport from "../modules/activity/AddWorkReport";
import EditWorkReport from "../modules/activity/EditWorkReport";
import ViewWorkReport from "../modules/activity/ViewWorkReport";
import CandidateList from "../modules/candidate/CandidateList";

const AppRoutes = () => {
  const { success } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token || success);

  return (
    <Routes>
      {isAuthenticated ? (
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/* <Route path="settings" element={<Settings />} /> */}

          <Route path="candidate-database" element={<CandidateList />} />
          <Route path="candidate" element={<CandidateList />} />

          <Route path="vacancies" element={<VacancyList />} />
          <Route path="vacancies/post" element={<PostVacancy />} />
          <Route path="vacancies/apply/:id" element={<ApplyCandidate />} />
          <Route path="vacancies/view/:id" element={<ViewSubmittedApplications />} />
          <Route path="vacancies/application-details/:appId" element={<SubmittedApplicationDetails />} />

          <Route path="activity" element={<DailyActivity />} />
          <Route path="activity/add" element={<AddWorkReport />} />
          <Route path="activity/edit/:id" element={<EditWorkReport />} />
          <Route path="activity/view/:id" element={<ViewWorkReport />} />

          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<Profile />} />

          <Route path="notification" element={<Notification />} />

          <Route path="get-started" element={<Navigate to="/" replace />} />
          <Route path="landing-page" element={<Navigate to="/" replace />} />
          <Route path="login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <>
          {PublicRoutes()}

          <Route path="/" element={<Navigate to="/get-started" replace />} />
          <Route path="*" element={<Navigate to="/get-started" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;