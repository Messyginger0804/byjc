"use client";
import React, { useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import Image from "next/image";
import me from "../../../public/bitmoji1.png"



export default function ContactForm() {
    const [loading, setLoading] = useState(false);
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
                className="mt-8 text-lg glass p-6 md:p-10 rounded-3xl sm:text-xl font-medium leading-relaxed shadow-modern dark:text-light"
            >
                <div className="space-y-6">
                    <div>
                        Hello! My name is{" "}
                        <input
                            name="Name"
                            type="text"
                            placeholder="your name"
                            required
                            className="w-full md:w-auto bg-dark/5 dark:bg-light/5 rounded-xl outline-none border-b-2 border-transparent focus:border-accent dark:focus:border-accentDark px-4 py-1 transition-all duration-300 placeholder:opacity-50"
                        />
                        <span className="hidden md:inline">.</span>
                    </div>
                    
                    <div>
                        You can reach me at
                        <input type={"tel" || 'email'} placeholder="email or cell"
                            name="Contact"
                            required
                            className="w-full md:w-auto bg-dark/5 dark:bg-light/5 rounded-xl outline-none border-b-2 border-transparent focus:border-accent dark:focus:border-accentDark px-4 py-1 md:mx-2 transition-all duration-300 placeholder:opacity-50"
                        />
                        <span className="hidden md:inline">.</span>
                    </div>

                    <div>
                        <textarea
                            name="Body"
                            required
                            placeholder="I'd love to talk about..."
                            rows={4}
                            className="w-full bg-dark/5 dark:bg-light/5 rounded-2xl outline-none border-b-2 border-transparent focus:border-accent dark:focus:border-accentDark px-4 py-3 transition-all duration-300 placeholder:opacity-50 mt-2" 
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full md:w-auto !px-10 !py-4"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </div>
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