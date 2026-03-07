import React from 'react'
import Hero from '../../components/shared/Hero'
import AppointmentBanner from '../../components/shared/AppointmentBanner'
import contact_image from '../../assets/assets_frontend/contact_image.png'
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import appointment_img from '/src/assets/assets_frontend/appointment_img.png'

const Contact = () => {
    return (
        <div>
            <AppointmentBanner image={appointment_img} text={'We are committed to providing you the best medical and healthcare services to help you live healthier and happier.'} title={'Contact Us'}  />

            <section className="bg-gray-50 py-20 px-6">

                {/* Heading
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-semibold text-slate-600">
                        CONTACT <span className="text-slate-800 font-bold">US</span>
                    </h2>
                </div> */}

                <div className="max-w-6xl mx-auto flex flex-col justify-center  items-center md:flex-row gap-16">

                    {/* Left Image */}

                    <img
                        src={contact_image}
                        alt="doctor vaccination"
                        className="rounded-lg h-110 w-110  shadow-md  object-cover"
                    />


                    {/* Right Content */}
                    <div className=" space-y-10">

                        {/* Office */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                OUR OFFICE
                            </h3>

                            <p className="text-gray-600 leading-relaxed">
                                00000 Willms Station <br />
                                Suite 000, Washington, USA
                            </p>

                            <p className="text-gray-600 mt-4">
                                Tel: (000) 000-0000
                            </p>

                            <p className="text-gray-600">
                                Email: greatstackdev@gmail.com
                            </p>
                        </div>

                        {/* Careers */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                CAREERS AT PRESCRIPTO
                            </h3>

                            <p className="text-gray-600 mb-6">
                                Learn more about our teams and job openings.
                            </p>

                            <button className="border border-gray-400 px-8 py-3 text-sm font-medium text-slate-700 hover:bg-slate-700 hover:text-white transition">
                                Explore Jobs
                            </button>
                        </div>

                    </div>

                </div>
            </section>


            <section className="bg-gray-50 py-16 px-6">

                <div className="max-w-6xl mx-auto">

                    {/* Title */}
                    <h2 className="text-3xl font-semibold text-slate-700 mb-10">
                        Find Us Here
                    </h2>

                    {/* Cards */}
                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Phone */}
                        <div className="flex items-center gap-4 bg-slate-200/50 p-5 rounded-xl flex-1">
                            <FiPhone className="text-sky-500 text-3xl" />
                            <div>
                                <h4 className="text-slate-700 font-semibold">Phone</h4>
                                <p className="text-gray-600 text-sm">+01-234-5678</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4 bg-slate-200/50 p-5 rounded-xl flex-1">
                            <FiMail className="text-sky-500 text-3xl" />
                            <div>
                                <h4 className="text-slate-700 font-semibold">Email</h4>
                                <p className="text-gray-600 text-sm">information@prohealth.com</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-4 bg-slate-200/50 p-5 rounded-xl flex-1">
                            <FiMapPin className="text-sky-500 text-3xl" />
                            <div>
                                <h4 className="text-slate-700 font-semibold">Location</h4>
                                <p className="text-gray-600 text-sm">
                                    121 King Street, New York, USA
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </div>
    )
}

export default Contact