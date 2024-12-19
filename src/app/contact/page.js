import ContactForm from "@/components/Contact/ContactForm";
import siteMetadata from "@/utils/metaData";
import Avator from "@/components/About/Avator";

export const metadata = {
    title: "Contact Me",
    description: `Contact me through the form available on this page or email me at ${siteMetadata.email}`,
};

export default function Contact() {
    return (
        <section className="w-full h-auto lg:h-[75vh] border-b-2 border-solid border-dark dark:border-light flex flex-col lg:flex-row items-center justify-center text-dark dark:text-light mt-20">
            <div>
                <Avator />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col text-left items-start justify-center px-5 xs:px-10 pb-10 lg:px-16 lg:h-[75vh] overflow-y-auto">
                <h2 className="font-bold capitalize text-2xl xs:text-3xl sm:text-4xl">Let's Connect!</h2>
                <ContactForm />
            </div>
        </section>
    );
}
