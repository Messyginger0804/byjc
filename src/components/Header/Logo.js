import Link from 'next/link'
import React from 'react'
import profileImg from '/public/profile.png'
import Image from 'next/image'



const Logo = () => {
    return (
        <Link href='/' className='flex items-center text-dark dark:text-light'>
            <div className=" w-12 md:w-16 rounded-full overflow-hidden bg-accent/20 dark:bg-accentDark/20 border-double border-4 border-dark dark:border-light
             mr-2 md:mr-4">
                <Image
                    src={profileImg}
                    alt='JC'
                    className='flex justify-center w-full h-full rounded-full'
                    sizes='333vw'
                    priority
                />
            </div>
            <span className='font-bold dark:font-semibold text-xl md:text-2xl lg:text-5xl'>Jeremy "JC" Ashley</span>
        </Link>
    )
}

export default Logo