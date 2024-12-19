import siteMetadata from "@/utils/metaData";
import Image from "next/image";
import privacy from "./water-cooler.png"

export const metadata = {
    title: "Privacy Policy",
    description: "Learn about how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
    return (
        <section className="w-full min-h-screen flex flex-col lg:flex-row items-start justify-center text-dark dark:text-light mt-20">
            <div className="w-full lg:w-1/3 flex justify-center items-center p-4">
                <Image
                    src={privacy}
                    alt="Privacy Policy"
                    className="max-w-full lg:max-w-[80%] h-auto rounded-lg"
                />
            </div>

            {/* Text Section */}
            <div className="w-full lg:w-2/3 px-5 xs:px-10 pb-10 lg:px-16">
                <h1 className="font-bold capitalize text-2xl xs:text-3xl sm:text-4xl mb-4">Privacy Policy</h1>
                <p className="text-base sm:text-lg leading-6 text-justify mb-6">
                    Welcome to the Privacy Policy page. Here, you will find information about how we collect, use, and protect your data when using this website and related tools, including the Jokes By JC Chrome extension.
                </p>

                <h2 className="font-bold text-lg sm:text-xl mb-4">Data Collection</h2>
                <p className="text-sm sm:text-base leading-6 text-justify mb-6">
                    We do not collect personal data. However, minimal browser storage may be used for preferences like joke frequency.
                </p>

                <h2 className="font-bold text-lg sm:text-xl mb-4">Permissions</h2>
                <p className="text-sm sm:text-base leading-6 text-justify mb-4">
                    The Jokes By JC Chrome extension may request the following permissions:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base mb-6">
                    <li>
                        <strong>Active Tab:</strong> To interact with the current tab for joke display.
                    </li>
                    <li>
                        <strong>Storage:</strong> To save user preferences locally in your browser.
                    </li>
                </ul>

                <h2 className="font-bold text-lg sm:text-xl mb-4">Third-Party APIs</h2>
                <p className="text-sm sm:text-base leading-6 text-justify mb-6">
                    The Jokes By JC Chrome extension fetches jokes dynamically using trusted APIs, including:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base mb-6">
                    <li>
                        <strong>Primary API:</strong> Fetches daily jokes.
                    </li>
                    <li>
                        <strong>Backup API:</strong> A fallback if the primary API is unavailable.
                    </li>
                </ul>

                <h2 className="font-bold text-lg sm:text-xl mb-4">Contact</h2>
                <p className="text-sm sm:text-base leading-6 text-justify mb-6">
                    For questions or concerns, email us at{" "}
                    <a href={`mailto:${siteMetadata.email}`} className="text-primary underline">
                        {siteMetadata.email}
                    </a>
                    .
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </section>
    );
}
