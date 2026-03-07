import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import PatientLayout from "../layouts/PatientLayout.jsx";

/* Public Pages */
import Home from "../pages/public/Home.jsx";
import About from "../pages/public/About.jsx";
import Doctors from "../pages/public/Doctors.jsx";
import Contact from "../pages/public/Contact.jsx";
import PatientLogin from "../pages/public/PatientLogin.jsx";

/* Patient Pages */
import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import PatientAppointments from "../pages/patient/PatientAppointments.jsx";
import PatientProfile from "../pages/patient/PatientProfile.jsx";

const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="contact" element={<Contact />} />
        <Route path="patient-login" element={<PatientLogin />} />
        <Route path="patient-signup" element={<PatientLogin mode="signup" />} />
      </Route>

      {/* PATIENT ROUTES */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;