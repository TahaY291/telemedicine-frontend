import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-transparent absolute w-full  z-50 transition-all">
            <div className="max-w-8xl mx-auto px-6 md:px-16 lg:px-24 py-4 flex items-center justify-between">

                <div className=''>
                    <a href="" className="shrink-0 flex items-center justify-center text-[#274760] gap-2">
                        <img
                            className="h-9"
                            src=""
                            alt="Logo"
                        />
                        <h1 className='text-3xl'>ProHealth</h1>
                    </a>
                </div>

                <div className="hidden lg:flex items-center gap-8 text-[#274760] font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="hover:text-blue-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-3">
                    <button className="px-5 py-2 bg-[#274760] hover:bg-[#1a3244] transition text-white rounded-full text-sm font-medium">
                        Login as Doctor
                    </button>
                    <button className="px-5 py-2 border border-[#274760] text-[#274760] hover:bg-gray-50 transition rounded-full text-sm font-medium">
                        Login as Patient
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                    className="lg:hidden p-2 text-[#274760] focus:outline-none"
                >
                    {isOpen ? (
                        <span className="text-2xl font-bold">✕</span> // Close Icon
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="21" height="2" rx="1" fill="currentColor" />
                            <rect x="8" y="6.5" width="13" height="2" rx="1" fill="currentColor" />
                            <rect x="4" y="13" width="17" height="2" rx="1" fill="currentColor" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`${isOpen ? 'flex' : 'hidden'} lg:hidden flex-col bg-white border-t border-gray-100 px-6 py-6 gap-4 absolute w-full left-0 shadow-xl z-40`}>
                {navLinks.map((link) => (
                    <a key={link.name} href={link.href} className="text-lg text-[#274760] border-b border-gray-50 pb-2">
                        {link.name}
                    </a>
                ))}
                <div className="flex flex-col gap-3 mt-4">
                    <button className="w-full py-3 bg-[#274760] text-white rounded-lg">Login as Doctor</button>
                    <button className="w-full py-3 border border-[#274760] text-[#274760] rounded-lg">Login as Patient</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;