"use client";
import React, { useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import Image from "next/image";
import me from "../../../public/bitmoji1.png"
import siteMetadata from "@/utils/metaData";



const inputClass =
    "peer w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-5 pb-2 pt-6 text-base outline-none transition-all duration-300 placeholder-transparent focus:border-accent dark:focus:border-accent-bright focus:bg-white/60 dark:focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgb(53_104_189/0.15)] dark:focus:shadow-[0_0_0_4px_rgb(107_155_255/0.18)]";
const labelClass =
    "pointer-events-none absolute left-5 top-4 origin-left text-base font-medium text-muted transition-all duration-300 ease-out peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent dark:peer-focus:text-accent-bright peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-75";

function Field({ id, name, label, multiline = false, autoComplete }) {
    return (
        <div className="group relative">
            {multiline ? (
                <textarea id={id} name={name} required placeholder=" " rows={5} className={`${inputClass} resize-none`} />
            ) : (
                <input id={id} name={name} type="text" placeholder=" " required autoComplete={autoComplete} className={inputClass} />
            )}
            <label htmlFor={id} className={labelClass}>{label}</label>
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-4 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-signal transition-transform duration-500 ease-out group-focus-within:scale-x-100" />
        </div>
    );
}

export default function ContactForm({ className = "", showBookingLink = true, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const form = useRef();

    const toastTheme = () =>
        document.documentElement.classList.contains("dark") ? "dark" : "light";

    const sendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSent(false);

        try {
            await emailjs.sendForm(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
                process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
                form.current,
                process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
            );
            toast(
                <div className="flex items-center gap-3">
                    <Image
                        width={100}
                        height={100}
                        src={me}
                        alt="JC"
                    /> <h3 className='text-base font-semibold md:text-lg'>Thank you for your message, I will get back to you ASAP!</h3>
                </div>,
                { theme: toastTheme() }
            );
            e.target.reset();
            setSent(true);
            onSuccess?.();
        } catch (err) {
            console.error("[ContactForm] EmailJS send failed:", err);
            toast.error("Something went wrong sending your message. Please try again or book an appointment instead.", { theme: toastTheme() });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative">
            <form
                ref={form}
                onSubmit={sendEmail}
                onChange={() => sent && setSent(false)}
                className={`w-full glass rounded-3xl p-6 sm:p-8 md:p-10 shadow-glow font-medium leading-relaxed ${className}`}
            >
                <div className="space-y-5">
                    <Field id="contact-name" name="Name" label="Name" autoComplete="name" />
                    <Field id="contact-info" name="Contact" label="Contact info (email or phone)" />
                    <Field id="contact-message" name="Body" label="Message" multiline />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink ${sent ? "bg-emerald-700" : "bg-signal-cta"}`}
                    >
                        {loading ? (
                            <>
                                <span aria-hidden="true" className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : sent ? (
                            <>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>Sent! Send another</span>
                            </>
                        ) : (
                            <>
                                <span>Send Message</span>
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </>
                        )}
                    </button>
                    <p role="status" aria-live="polite" className="sr-only">
                        {loading ? "Sending your message" : sent ? "Message sent" : ""}
                    </p>

                    {showBookingLink && (
                        <>
                            <div className="relative flex items-center justify-center">
                                <div className="flex-grow border-t border-dark/10 dark:border-white/10"></div>
                                <span className="eyebrow mx-4">or</span>
                                <div className="flex-grow border-t border-dark/10 dark:border-white/10"></div>
                            </div>

                            <a
                                href={siteMetadata.booking}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-dark/20 dark:border-white/25 px-6 py-4 text-base font-semibold transition-all duration-300 hover:bg-dark hover:text-white dark:hover:bg-white dark:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink"
                            >
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <span>Book an appointment</span>
                            </a>
                        </>
                    )}
                </div>
            </form>
            <ToastContainer
                position="top-left"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                draggable
                pauseOnHover
                theme="light" />
        </div>
    );
}
