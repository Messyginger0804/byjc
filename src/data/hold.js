<>
    <h5 className='text-center'>My Recent Work</h5>
    <h3 className='text-center text-3xl py-1 text-sky-300'>Contracted Jobs</h3>

    <div className=' flex justify-center flex-wrap lg:flex gap-10'>
        <div className='text-center p-10 w-[280px] rounded-xl my-10 shadow-sky-400 shadow-xl hover:shadow-sky-300'>
            <h3 className='text-lg font-medium pt-8 pb-2'>Top Flight Lawn Service</h3>
            <p><span className='px-2'>client:</span>Rene Guillen</p>
            <a href='tel:2147794259' className='hover:underline'>214-779-4259</a>
            <Link href='https://topflightlawnservice.vercel.app/'>
                <div className='flex justify-center'>
                    <Image
                        className='flex justify-center fit object-center rounded'
                        src={TFLS}
                        width={100}
                        height={100}
                        alt='TFLS Logo'
                    />
                </div>
            </Link>
            <h4 className='py-4 text-sky-200'>DFW Landscaping Company</h4>
        </div>

        <div className='text-center p-10 rounded-xl my-10 w-[280px] shadow-sky-400 shadow-xl hover:shadow-sky-300'>
            <h3 className='text-lg font-medium pt-8 pb-2'>JLD Counseling</h3>
            <p><span className='px-2'>client:</span>Jason Daughtery</p>
            <a href='tel:2147794259' className='hover:underline'>214-785-7426</a>
            <Link href='https://jldcounseling.netlify.com/'>
                <div className='flex justify-center'>
                    <Image
                        className='flex justify-center fit object-center'
                        src={JLD}
                        width={200}
                        height={200}
                        alt='JLD Logo'
                    />
                </div>
            </Link>
            <h4 className='py-4 text-sky-200'>DFW Therapy and Counseling Clinic</h4>
        </div>
    </div>
</>