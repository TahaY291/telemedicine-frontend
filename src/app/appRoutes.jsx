import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // ✅ only this needed

import PublicLayout from "../layouts/PublicLayout.jsx";
import PatientLayout from "../layouts/PatientLayout.jsx";
import DoctorLayout from "../layouts/DoctorLayout.jsx";

import Home from "../pages/public/Home.jsx";
import About from "../pages/public/About.jsx";
import Doctors from "../pages/public/Doctors.jsx";
import Contact from "../pages/public/Contact.jsx";
import PatientLogin from "../pages/public/PatientLogin.jsx";
import DoctorLogin from "../pages/public/DoctorLogin.jsx";

import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import PatientAppointments from "../pages/patient/PatientAppointments.jsx";
import PatientProfile from "../pages/patient/PatientProfile.jsx";
import PatientRecords from "../pages/patient/PatientRecords.jsx";
import PatientDoctorDetail from "../pages/patient/PatientDoctorDetail.jsx";

import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import DoctorProfile from "../pages/doctor/DoctorProfile.jsx";
import DoctorAppointments from "../pages/doctor/DoctorAppointments.jsx";
import DoctorConsultations from "../pages/doctor/DoctorConsultations.jsx";
import DoctorPrescriptions from "../pages/doctor/DoctorPrescriptions.jsx";
import DoctorPatients from "../pages/doctor/DoctorPatients.jsx";
import DoctorNotifications from "../pages/doctor/DoctorNotifications.jsx";
import DoctorReports from "../pages/doctor/DoctorReports.jsx";

import VerifyEmail from "../pages/shared/VerifyEmail.jsx";
import ChangePassword from "../pages/shared/ChangePassword.jsx";
import DoctorPatientProfile from "../pages/doctor/DoctorPatientProfile.jsx";
import Notifications from "../pages/doctor/DoctorNotifications.jsx";

const PatientProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#274760]">
          <span className="w-5 h-5 border-2 border-[#274760]/30 border-t-[#274760] rounded-full animate-spin" />
          <span className="text-sm font-medium">Checking your session...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return <Navigate to="/patient-login" replace />;
  }
  return <Outlet />;
};

const DoctorProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#274760]">
          <span className="w-5 h-5 border-2 border-[#274760]/30 border-t-[#274760] rounded-full animate-spin" />
          <span className="text-sm font-medium">Checking your session...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "doctor") {
    return <Navigate to="/doctor-login" replace />;
  }
  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === "patient") return <Navigate to="/patient" replace />;
    if (user.role === "doctor") return <Navigate to="/doctor" replace />;
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
          <Route path="doctor-login" element={<DoctorLogin />} />
          <Route path="doctor-signup" element={<DoctorLogin mode="signup" />} />
        </Route>
      </Route>

      <Route element={<PatientProtectedRoute />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:doctorId" element={<PatientDoctorDetail />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="/patient/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route element={<DoctorProtectedRoute />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="consultations" element={<DoctorConsultations />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="notifications" element={<DoctorNotifications />} />
          <Route path="reports" element={<DoctorReports />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:doctorId" element={<PatientDoctorDetail />} />
          <Route path="patient/:patientId" element={<DoctorPatientProfile />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="/doctor/notifications" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRoutes;