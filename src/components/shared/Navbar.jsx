import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../context/Context.jsx';

const ProHealthLogo = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer circle */}
    <circle cx="19" cy="19" r="18" fill="#274760" />
    {/* Cross shape — classic medical symbol */}
    <rect x="15" y="8" width="8" height="22" rx="2" fill="white" />
    <rect x="8" y="15" width="22" height="8" rx="2" fill="white" />
    {/* Small accent dot in center */}
    <circle cx="19" cy="19" r="3" fill="#274760" />
  </svg>
);

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { setRole } = useContext(AppContext);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-transparent absolute w-full z-50 transition-all">
            <div className="max-w-8xl mx-auto px-6 md:px-16 lg:px-24 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="shrink-0 flex items-center gap-2.5 text-[#274760]">
                    <ProHealthLogo />
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-extrabold tracking-tight text-[#274760]">
                            Pro<span className="text-[#4a90b8]">Health</span>
                        </span>
                        <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-slate-400">
                            Medical Care
                        </span>
                    </div>
                </Link>

                {/* Desktop nav links */}
                <div className="hidden lg:flex items-center gap-8 text-[#274760] font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="hover:text-[#4a90b8] transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop CTA buttons */}
                <div className="hidden lg:flex items-center gap-3">
                    <Link to="/patient-login" onClick={() => setRole('patient')}>
                        <button className="px-5 py-2 border cursor-pointer border-[#274760] text-[#274760] hover:bg-[#274760] hover:text-white rounded-full transition-colors">
                            Login as Patient
                        </button>
                    </Link>
                    <Link to="/patient-login" onClick={() => setRole('doctor')}>
                        <button className="px-5 py-2 cursor-pointer bg-[#274760] text-white hover:bg-white hover:text-[#274760] hover:border hover:border-[#274760] rounded-full transition-colors">
                            Login as Doctor
                        </button>
                    </Link>
                </div>

                {/* Mobile menu toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                    className="lg:hidden p-2 text-[#274760] focus:outline-none"
                >
                    {isOpen ? (
                        <span className="text-2xl font-bold">✕</span>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="21" height="2" rx="1" fill="currentColor" />
                            <rect x="8" y="6.5" width="13" height="2" rx="1" fill="currentColor" />
                            <rect x="4" y="13" width="17" height="2" rx="1" fill="currentColor" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile dropdown */}
            <div className={`${isOpen ? 'flex' : 'hidden'} lg:hidden flex-col bg-white border-t border-gray-100 px-6 py-6 gap-4 absolute w-full left-0 shadow-xl z-40`}>
                {navLinks.map((link) => (
                    <Link key={link.name} to={link.path} className="text-lg text-[#274760] border-b border-gray-50 pb-2">
                        {link.name}
                    </Link>
                ))}
                <div className="flex flex-col gap-3 mt-4">
                    <Link to="/patient-login" onClick={() => setRole('patient')}>
                        <button className="px-5 py-2 border border-[#274760] text-[#274760] rounded-full w-full">
                            Login as Patient
                        </button>
                    </Link>
                    <Link to="/patient-login" onClick={() => setRole('doctor')}>
                        <button className="px-5 py-2 bg-[#274760] text-white rounded-full w-full">
                            Login as Doctor
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;