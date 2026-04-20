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
        <div className="w-full relative">
            <form
                ref={form}
                onSubmit={sendEmail}
                className="w-full text-lg glass p-8 md:p-12 rounded-3xl sm:text-xl font-medium leading-relaxed shadow-2xl dark:text-light transition-all duration-500 hover:shadow-accent/5 dark:hover:shadow-accentDark/5"
            >
                <div className="space-y-8">
                    <div className="group transition-all duration-300">
                        <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-accent dark:text-accentDark opacity-70 group-focus-within:opacity-100 transition-opacity">
                            Name
                        </label>
                        <input
                            name="Name"
                            type="text"
                            placeholder="John Doe"
                            required
                            className="w-full bg-dark/5 dark:bg-light/5 rounded-2xl outline-none border-2 border-transparent focus:border-accent dark:focus:border-accentDark px-6 py-3 transition-all duration-300 placeholder:opacity-30 focus:bg-white/40 dark:focus:bg-black/40 shadow-inner"
                        />
                    </div>
                    
                    <div className="group transition-all duration-300">
                        <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-accent dark:text-accentDark opacity-70 group-focus-within:opacity-100 transition-opacity">
                            Contact Info
                        </label>
                        <input 
                            type="text" 
                            placeholder="email or phone number"
                            name="Contact"
                            required
                            className="w-full bg-dark/5 dark:bg-light/5 rounded-2xl outline-none border-2 border-transparent focus:border-accent dark:focus:border-accentDark px-6 py-3 transition-all duration-300 placeholder:opacity-30 focus:bg-white/40 dark:focus:bg-black/40 shadow-inner"
                        />
                    </div>

                    <div className="group transition-all duration-300">
                        <label className="block text-sm font-semibold uppercase tracking-wider mb-2 text-accent dark:text-accentDark opacity-70 group-focus-within:opacity-100 transition-opacity">
                            Message
                        </label>
                        <textarea
                            name="Body"
                            required
                            placeholder="I'd love to talk about..."
                            rows={4}
                            className="w-full bg-dark/5 dark:bg-light/5 rounded-2xl outline-none border-2 border-transparent focus:border-accent dark:focus:border-accentDark px-6 py-4 transition-all duration-300 placeholder:opacity-30 mt-2 focus:bg-white/40 dark:focus:bg-black/40 shadow-inner resize-none" 
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 !py-5 flex items-center justify-center gap-2 group hover:scale-[1.02]"
                        >
                            {loading ? "Sending..." : (
                                <>
                                    <span>Send Message</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="relative flex items-center justify-center py-2">
                        <div className="flex-grow border-t border-dark/10 dark:border-light/10"></div>
                        <span className="flex-shrink mx-4 text-sm font-bold text-dark/30 dark:text-light/30 uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-dark/10 dark:border-light/10"></div>
                    </div>

                    <a
                        href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ38O2Sh9DBh0qm00_QyDh4GGQ0_-AN_8QBcYf7HTOBglarmGzLFKKTfbpLSZ0vRoqkjkq3k3zP0?gv=true"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full !py-5 flex items-center justify-center gap-2 bg-transparent hover:scale-[1.02]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>Book an appointment</span>
                    </a>
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
        </div>
    );
}