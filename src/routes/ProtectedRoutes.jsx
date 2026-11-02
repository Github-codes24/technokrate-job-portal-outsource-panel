import { Route, Navigate } from "react-router-dom";
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

const ProtectedRoutes = () => {
  return [
    <Route key="main" path="/" element={<MainLayout />}>
      <Route index element={<Dashboard />} />
      {/* <Route path="settings" element={<Settings />} /> */}

      <Route path="vacancies" element={<VacancyList />} />
      <Route path="vacancies/post" element={<PostVacancy />} />
      <Route path="vacancies/apply/:id" element={<ApplyCandidate />} />
      <Route path="vacancies/view/:id" element={<ViewSubmittedApplications />} />
      <Route path="vacancies/application-details/:appId" element={<SubmittedApplicationDetails />} />

      <Route path="profile" element={<Profile />} />
      <Route path="profile/edit" element={<Profile />} />

      <Route path="notification" element={<Notification />} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Route>
  ];
};

export default ProtectedRoutes;