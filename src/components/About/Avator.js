import Image from 'next/image'
import React from 'react'
import profileCharacter from "@/components/About/assets/justme.png";
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { CgFileDocument } from "react-icons/cg";
import siteMetadata from '@/utils/metaData';

function Avator() {
    return (
        <>
            <div className="flex justify-center shadow-lg shadow-accent dark:shadow-light items-center mx-auto bg-gradient-to-b from-accent dark:from-accentDark rounded-full relative overflow-hidden w-80 h-80 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <Image
                    src={profileCharacter}
                    className='rounded-lg'
                    alt="Profile Character"
                    priority
                    fill
                    style={{ objectFit: "cover" }}
                />
            </div>
            <div className='text-5xl flex justify-center gap-16 py-3 text-accent dark:text-accentDark '>
                <a href={siteMetadata.linkedin} target='_blank'>
                    <AiFillLinkedin className='shadow-lg dark:shadow-yellow-50 shadow-accent rounded-full dark:hover:text-accent/60 hover:cursor-pointer' /> </a>
                <a href={siteMetadata.github} target='_blank'><AiFillGithub className='shadow-lg shadow-accent dark:shadow-yellow-50 rounded-full dark:hover:text-accent/60 hover:cursor-pointer' /></a>
                <a href={siteMetadata.resume} target='_blank'><CgFileDocument className='shadow-lg shadow-accent dark:shadow-yellow-50 rounded-full dark:hover:text-accent/60 hover:cursor-pointer' /></a>
            </div>
        </>
    )
}

export default Avator