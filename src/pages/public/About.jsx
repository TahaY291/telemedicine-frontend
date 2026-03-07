import React from 'react'
import Hero from '../../components/shared/Hero'
import about_image from '../../assets/assets_frontend/about_image.png'
const About = () => {
    return (
        <div>
            <Hero />
            <section className="text-center py-20 px-5 bg-gray-50">
                <h2 className="text-3xl font-semibold mb-14 text-slate-700">
                    Our Values
                </h2>

                <div className="max-w-5xl mx-auto space-y-10">

                    {/* Row 1 */}
                    <div className="flex justify-center gap-10 flex-wrap">

                        {/* Compassion */}
                        <div className="bg-white p-8 rounded-xl shadow-md w-72">
                            <div className="text-sky-500 text-lg mb-2">●</div>
                            <h3 className="text-slate-700 text-xl font-semibold mb-2">Compassion</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Praesentium reprehenderit.
                            </p>
                        </div>

                        {/* Excellence */}
                        <div className="bg-white p-8 pt-14 rounded-xl shadow-md relative w-72">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-5 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                <span>●</span>
                                Excellence
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Praesentium reprehenderit.
                            </p>
                        </div>

                        {/* Integrity */}
                        <div className="bg-white p-8 rounded-xl shadow-md w-72">
                            <div className="text-sky-500 text-lg mb-2">●</div>
                            <h3 className="text-slate-700 font-semibold mb-2">Integrity</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Praesentium reprehenderit.
                            </p>
                        </div>

                    </div>


                    {/* Row 2 */}
                    <div className="flex justify-center gap-10 flex-wrap">

                        {/* Respect */}
                        <div className="bg-white p-8 rounded-xl shadow-md w-72">
                            <div className="text-sky-500 text-lg mb-2">●</div>
                            <h3 className="text-slate-700 font-semibold mb-2">Respect</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Praesentium reprehenderit.
                            </p>
                        </div>

                        {/* Teamwork */}
                        <div className="bg-white p-8 rounded-xl shadow-md w-72">
                            <div className="text-sky-500 text-lg mb-2">●</div>
                            <h3 className="text-slate-700 font-semibold mb-2">Teamwork</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Praesentium reprehenderit.
                            </p>
                        </div>

                    </div>

                </div>
            </section>
            <section className="bg-gray-50 py-20 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">

                    <div className="flex-1">
                        <img
                            src={about_image}
                            alt="About ProHealth"
                            className="rounded-2xl shadow-lg w-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold text-slate-700 mb-3">
                            About Us
                        </h1>

                        <h3 className="text-sky-500 text-xl font-semibold mb-4">
                            ProHealth
                        </h3>
                        <div className='flex flex-col gap-5'>
                            <p className="text-gray-600 leading-relaxed text-xs text-semibold md:text-sm">
                                Welcome to ProHealth, your trusted partner in managing your healthcare needs conveniently and efficiently. At ProHealth, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
                            </p>
                            <p className="text-gray-600 leading-relaxed text-xs text-semibold md:text-sm">
                                ProHealth is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, ProHealth is here to support you every step of the way.
                            </p>
                        </div>
                        <h1 className='text-sm font-bold text-gray-700 mt-8'>Our Vision</h1>
                        <p className='text-gray-600 leading-relaxed text-xs mt-2 text-semibold md:text-sm'>Our vision at Prescripto is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.</p>
                    </div>

                </div>
            </section>
        </div>
    )
}

export default About