import { Outlet } from "react-router-dom";
import PatientSidebar from "../components/patientComponent/PatientSidebar";
import PatientNavbar from "../components/patientComponent/PatientNavbar";


const PatientLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <PatientSidebar />
            <div className="flex flex-col flex-1">
                <PatientNavbar />
                <main className="p-6 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PatientLayout;