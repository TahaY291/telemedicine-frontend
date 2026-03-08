import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // ✅ only this needed

import PublicLayout from "../layouts/PublicLayout.jsx";
import PatientLayout from "../layouts/PatientLayout.jsx";

import Home from "../pages/public/Home.jsx";
import About from "../pages/public/About.jsx";
import Doctors from "../pages/public/Doctors.jsx";
import Contact from "../pages/public/Contact.jsx";
import PatientLogin from "../pages/public/PatientLogin.jsx";

import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import PatientAppointments from "../pages/patient/PatientAppointments.jsx";
import PatientProfile from "../pages/patient/PatientProfile.jsx";

const PatientProtectedRoute = () => {
  const { user } = useAuth();

  if (!user || user.role !== "patient") {
    return <Navigate to="/patient-login" replace />;
  }
  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === "patient") return <Navigate to="/patient" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="contact" element={<Contact />} />
          <Route path="patient-login" element={<PatientLogin />} />
          <Route path="patient-signup" element={<PatientLogin mode="signup" />} />
        </Route>
      </Route>

      <Route element={<PatientProtectedRoute />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;