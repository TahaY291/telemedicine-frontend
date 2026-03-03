// src/layouts/PublicLayout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar.jsx";
import Footer from "../components/shared/Footer";

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
