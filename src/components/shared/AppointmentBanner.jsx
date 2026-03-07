import React from 'react'


const AppointmentBanner = ({ image, text, title }) => {
    return (
        <div className='max-w-8xl mx-auto px-6 md:px-16 lg:px-24  
    flex flex-col lg:flex-row items-center justify-between 
    hero-bg-clr min-h-[55vh] pt-24'>

            <div className='w-full lg:basis-[50%] text-center lg:text-left'>
                <h1 className='font-bold text-3xl sm:text-4xl md:text-5xl text-[#274760]'>
                    {title}
                </h1>

                <p className='text-base sm:text-lg text-gray-600 mt-4'>
                    {text}
                </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className='w-full lg:basis-[50%] relative mt-10 lg:mt-0 flex justify-center '>
                <img
                    src={image}
                    alt="Hero Image"
                    className="w-110 max-w-md lg:max-w-full  h-110 rounded-lg relative top-0"
                />
            </div>

        </div>
    )
}

export default AppointmentBanner