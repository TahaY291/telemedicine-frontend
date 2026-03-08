import React from 'react'

const Hero = () => {
  return (
    <div className='pt-32 hero-bg-clr flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20 '>

        {/* LEFT CONTENT */}
        <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] -md:mb-7.5'>
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
        <div className='md:w-1/2 relative'>
            <img 
              src="/src/assets/assets_frontend/header_img.png" 
              alt="Hero Image" 
              className="w-full md:absolute bottom-0 h-auto rounded-lg"
            />
        </div>

    </div>
  )
}

export default Hero