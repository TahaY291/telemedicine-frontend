import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/doctorComponent/DoctorSidebar.jsx";
import DoctorNavbar from "../components/doctorComponent/DoctorNavbar.jsx";

const DoctorLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DoctorSidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <DoctorNavbar />
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;

