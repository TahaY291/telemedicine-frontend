import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#1674A5] text-white ">

            {/* Top Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-12 grid md:grid-cols-4 gap-10">

                {/* Logo + Contact */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">ProHealth</h2>

                    <p className="text-sm mb-3">
                        123 Health Street, Medical City, USA
                    </p>

                    <p className="text-sm mb-3">
                        +1 (555) 123-4567
                    </p>

                    <p className="text-sm">
                        info@prohealth.com
                    </p>
                </div>

                {/* Company */}
                <div>
                    <h3 className="font-semibold mb-4">Company</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="cursor-pointer hover:underline">Home</li>
                        <li className="cursor-pointer hover:underline">About us</li>
                        <li className="cursor-pointer hover:underline">Doctors</li>
                        <li className="cursor-pointer hover:underline">Contact</li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="font-semibold mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="cursor-pointer hover:underline">Privacy Policy</li>
                        <li className="cursor-pointer hover:underline">Terms and Conditions</li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h3 className="font-semibold mb-4">Follow us</h3>

                    <div className="flex gap-4">
                        <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30">
                            <FaFacebookF />
                        </div>

                        <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30">
                            <FaTwitter />
                        </div>

                        <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30">
                            <FaInstagram />
                        </div>

                        <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30">
                            <FaLinkedinIn />
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Line */}
            <div className="border-t border-white/20 text-center py-4 text-sm">
                © {new Date().getFullYear()} ProHealth. All rights reserved.
            </div>

        </footer>
    );
};

export default Footer;