import React from 'react'
import appointment_img from '/src/assets/assets_frontend/appointment_img.png'

const Banner = ({image , text , title}) => {
    return (
        <section className="max-w-8xl  mx-auto px-6 md:px-16 lg:px-24 mt-10 pb-20">
            <div className="flex bg-[#3e7bc4] rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 mt-20 md:mx-10">
                {/* Left Content */}
                <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white">
                        <p>Book Appointment </p>
                        <p className='mt-4'> With 100+ Trusted Doctors</p>
                    </div>
                    <button className="mt-6 bg-white text-gray-700 px-6 py-3 rounded-full font-medium hover:scale-105 transition">
                        Create account
                    </button>
                </div>
                {/* Right Image */}
                <div className="hidden md:block md:w-1/2 lg:w-92.5 relative">
                    <img
                        src={appointment_img}
                        alt="appointment"
                        className="w-full absolute bottom-0 right-0 max-w-md"
                    />
                </div>
            </div>
        </section>
    )
}

export default Banner