"use client";
import React, { useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import Image from "next/image";
import me from "../../../public/bitmoji1.png";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CircularProgress } from '@mui/material';

// Validation schema using Yup
const validationSchema = Yup.object({
    Name: Yup.string().required('Name is required'),
    Contact: Yup.string().required('Contact is required'),
    Body: Yup.string().required('Message is required')
});

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [formFilled, setFormFilled] = useState(false);
    const form = useRef();

    const sendEmail = async (values, { resetForm }) => {
        setLoading(true);

        try {
            console.log('Form Values:', values); // Log form values or process them as needed
            await emailjs.sendForm('service_yc58hva', 'template_1ep997k', form.current, '_0eJeVE_0upDw61qU');
            toast(
                <div className="flex">
                    <Image
                        height={100}
                        src={me}
                        alt="JC"
                    />
                    <h3 className='text-center text-2xl md:text-4xl'>Thank you for your message, I will get back to you ASAP!</h3>
                </div>
            );
            resetForm();
            setFormFilled(false);
        } catch (error) {
            toast.error('Something went wrong, please try again later.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Formik
                initialValues={{ Name: '', Contact: '', Body: '' }}
                validationSchema={validationSchema}
                onSubmit={sendEmail}
                validate={({ Name, Contact, Body }) => {
                    setFormFilled(Name && Contact && Body);
                }}
                innerRef={form} // Use innerRef to access form for emailjs
            >
                {({ isSubmitting }) => (
                    <Form
                        ref={form}
                        className="mt-6 w-full text-base xs:text-lg bg-accent/50 dark:bg-accentDark p-4 rounded-xl sm:text-xl font-medium leading-relaxed font-in dark:text-dark"
                    >
                        <div className="flex flex-wrap text-center ">

                            <div className="mb-4">
                                Hello! My name is{" "}
                                <Field
                                    name="Name"
                                    type="text"
                                    placeholder="your name"
                                    className="bg-red-100/20 rounded-2xl outline-none border-0 text-center p-0 mx-2 focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray focus:border-gray"
                                />
                                <ErrorMessage name="Name" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            <div className="mb-4">
                                You can reach me at
                                <Field
                                    name="Contact"
                                    type="text"
                                    placeholder="email or cell#"
                                    className="bg-red-100/20 rounded-2xl outline-none border-0 p-0 mx-2 text-center focus:ring-0 placeholder:text-center placeholder:text-lg border-b border-gray focus:border-gray"
                                />
                                <ErrorMessage name="Contact" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <Field
                                as="textarea"
                                name="Body"
                                placeholder="I think your blog is really cool..."
                                rows={3}
                                className="bg-red-100/20 rounded-2xl pl-4 w-full outline-none border-0 p-0 mx-0 focus:ring-0 placeholder:text-lg border-b border-gray focus:border-gray"
                            />
                            <ErrorMessage name="Body" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className={`mt-8 font-medium capitalize text-lg sm:text-xl py-2 sm:py-3 px-6 sm:px-8 border-2 border-solid rounded cursor-pointer flex items-center justify-center ${isSubmitting || loading
                                ? 'bg-black text-yellow-400 opacity-50 cursor-not-allowed'
                                : formFilled
                                    ? 'bg-black text-yellow-500 hover:bg-yellow-600'
                                    : 'bg-black text-yellow-300 opacity-70'
                                }`}
                        >
                            {loading ? <CircularProgress size={24} className="mr-2" /> : 'Send Request'}
                        </button>

                    </Form>
                )}
            </Formik>
            <ToastContainer
                position="top-left"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    );
}
