import React from 'react'

const Hero = () => {
  return (
    <div className='max-w-8xl mx-auto px-6 md:px-16 lg:px-24 py-4 
    flex flex-col lg:flex-row items-center justify-between 
    hero-bg-clr min-h-[80vh] pt-32'>

        {/* LEFT CONTENT */}
        <div className='w-full lg:basis-[50%] text-center lg:text-left'>
            <h1 className='font-bold text-3xl sm:text-4xl md:text-5xl text-[#274760]'>
              Your Partner in Health and Wellness
            </h1>

            <p className='text-base sm:text-lg text-gray-600 mt-4'>
              We are committed to providing you the best medical and healthcare services to help you live healthier and happier.
            </p>

            <button className="mt-6 px-6 py-3 bg-[#274760] hover:bg-[#1a3244] transition text-white rounded-full text-sm font-medium">
              Book Appointment
            </button>
        </div>

        {/* RIGHT IMAGE */}
        <div className='w-full lg:basis-[50%] relative mt-10 lg:mt-0 flex justify-center '>
            <img 
              src="/src/assets/assets_frontend/header_img.png" 
              alt="Hero Image" 
              className="w-full max-w-md lg:max-w-full  h-auto rounded-lg relative top-8.5"
            />
        </div>

    </div>
  )
}

export default Hero