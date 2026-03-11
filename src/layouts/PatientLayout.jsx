import { Outlet } from "react-router-dom";
import PatientSidebar from "../components/patientComponent/PatientSidebar";
import PatientNavbar from "../components/patientComponent/PatientNavbar";


const PatientLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <PatientSidebar />
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <PatientNavbar />
                <main className="p-6 flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default PatientLayout;