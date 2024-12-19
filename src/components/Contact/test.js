"use client";
import React, { useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
// import Logo from "../Header/Logo";
import Image from "next/image";
import me from "../../../public/bitmoji1.png"


// import { useForm } from "react-hook-form";

export default function ContactForm() {

    const form = useRef();
    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm('service_yc58hva', 'template_1ep997k', form.current, '_0eJeVE_0upDw61qU')
            // .then(toast('Thank you for your message, I will get back to you ASAP!'))
            .then(toast(
                <div className="flex">
                    <Image
                        height={100}
                        src={me}
                        alt="JC"
                    /> <h3 className='text-center text-2xl md:text-4xl'>Thank you for your message, I will get back to you ASAP!</h3>
                </div>
            ))
        e.target.reset();

    };

    return (

        <>

            <form
                ref={form}
                onSubmit={sendEmail}
                className="mt-6 text-base xs:text-lg bg-accent/50 dark:bg-accentDark p-4 rounded-xl sm:text-xl font-medium leading-relaxed font-in dark:text-dark"
            >
                Hello! My name is{" "}
                <input
                    name="Name"
                    type="text"
                    placeholder="your name"
                    required
                    className="bg-red-100/20 rounded-2xl outline-none border-0 text-center p-0 mx-2 focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray 
        focus:border-gray"
                />
                You can reach me at
                <input type={"tel" || 'email'} placeholder="email or cell#"
                    name="Contact"
                    required
                    className="bg-red-100/20 rounded-2xl outline-none border-0 p-0 mx-2 text-center focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray 
        focus:border-gray"/>

                <textarea
                    name="Body"
                    required
                    placeholder="I think your blog is really cool..."
                    rows={3}
                    className="bg-red-100/20 rounded-2xl pl-4 w-full outline-none border-0 p-0 mx-0 focus:ring-0  placeholder:text-lg border-b border-gray 
        focus:border-gray" />
                <input type="submit" value="send request"
                    className="bg-red-100/80 mt-8 font-medium inline-block capitalize text-lg sm:text-xl py-2 sm:py-3 px-6 sm:px-8 border-2 border-solid border-dark dark:border-light rounded cursor-pointer" />
            </form>
            <ToastContainer
                lt
                position="top-left"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                draggable
                pauseOnHover
                theme="dark" />
        </>
    );
}