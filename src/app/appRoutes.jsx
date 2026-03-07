import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import Home from "../pages/public/Home.jsx";
import About from "../pages/public/About.jsx";
import Doctors from "../pages/public/Doctors.jsx";
import Contact from "../pages/public/Contact.jsx";
import PatientLogin from "../pages/public/PatientLogin.jsx";
import DoctorLogin from "../pages/public/DoctorLogin.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="contact" element={<Contact />} />
                <Route path="patient-login" element={<PatientLogin />} />
                <Route path="doctor-login" element={<DoctorLogin />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;