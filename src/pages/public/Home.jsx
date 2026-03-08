import React from 'react'
import Hero from '../../components/shared/Hero'
import Neurologist from '/src/assets/assets_frontend/Neurologist.svg'
import Pediatrician from '/src/assets/assets_frontend/Pediatricians.svg'
import Gastroenterologist from '/src/assets/assets_frontend/Gastroenterologist.svg'
import General_physician from '/src/assets/assets_frontend/General_physician.svg'
import Gynecologist from '/src/assets/assets_frontend/Gynecologist.svg'
import Dermatologist from '/src/assets/assets_frontend/Dermatologist.svg'
import AppointmentBanner from '../../components/shared/AppointmentBanner'
import Banner from '../../components/shared/Banner'

const Home = () => {
    const specialities = [
        { name: 'Cardiology', icon: Neurologist },
        { name: 'Dermatology', icon: Dermatologist },
        { name: 'Pediatrics', icon: Gastroenterologist },
        { name: 'Orthopedics', icon: General_physician },
        { name: 'Gynecology', icon: Gynecologist },
        { name: 'Pediatrician', icon: Pediatrician },
    ];

    return (
        <div className='bg-[#eff6fc]'>
            <Hero />
            <div className="bg-[#eff6fc] py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">

                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#274760]">
                        Find by Speciality
                    </h2>

                    {/* Subtitle */}
                    <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-sm md:text-base">
                        Simply browse through our extensive list of trusted doctors,
                        schedule your appointment hassle-free.
                    </p>

                    {/* Icons Section */}
                    <div className="mt-14 flex items-center flex-wrap justify-center gap-3">
                        {specialities.map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="w-28 h-28 rounded-full bg-[#dbe3ea] flex items-center justify-center">
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <p className="mt-4 text-sm text-gray-700">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div>
                {/* we wil show doctors here */}
            </div>

            <Banner/>
            
        </div>
    )
}

export default Home