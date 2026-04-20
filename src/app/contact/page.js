import ContactForm from "@/components/Contact/ContactForm";
import siteMetadata from "@/utils/metaData";
import Avator from "@/components/Portfolio/Avator";

export const metadata = {
    title: "Contact Me",
    description: `Contact me through the form available on this page or email me at ${siteMetadata.email}`,
};

export default function Contact() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-start text-dark dark:text-light py-12 md:py-24 px-4 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 dark:bg-accentDark/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accentDark/20 dark:bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
            
            <div className="container max-w-6xl mx-auto flex flex-col items-center">
                {/* Header Section matching About page style */}
                <div className="flex flex-col items-center justify-center mb-12 md:mb-20 animate-fade-in text-center">
                    <h2 className="font-bold capitalize text-4xl xs:text-5xl lg:text-7xl tracking-tight text-balance leading-tight">
                        Let&apos;s <span className="text-accent dark:text-accentDark">Connect!</span>
                    </h2>
                    <p className="mt-4 text-lg md:text-xl opacity-80 max-w-2xl text-balance">
                        Have a project in mind or just want to say hi? Feel free to reach out using the form below or book a quick chat.
                    </p>
                </div>

                <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
                    <div className="flex flex-col items-center space-y-8 animate-fade-in order-2 lg:order-1">
                        <Avator />
                    </div>
                    
                    <div className="w-full lg:w-1/2 flex flex-col items-start justify-center animate-slide-in order-1 lg:order-2">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
