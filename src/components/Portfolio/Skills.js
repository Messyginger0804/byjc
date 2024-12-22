import { backTech, frontTech } from "@/data/tech";

const Skills = () => {
    return (
        <section className="w-full flex flex-col p-5 xs:p-10 sm:p-12 md:p-16 lg:p-20 text-dark dark:text-light">
            <span className="font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-accent dark:text-accentDark">
                I'm comfortable working with...
            </span>

            {/* Front-End Technologies */}
            <h3 className="ml-12 sm:ml-20 md:ml-24">
                <span className="inline-block bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
                    Front-End Technologies
                </span>
            </h3>
            <ul className="flex flex-wrap mt-4 justify-center">
                {frontTech.map((item, index) => {
                    return (
                        <li
                            key={index}
                            className="flex items-center gap-2 font-semibold capitalize text-sm lg:text-lg py-2 lg:py-5 px-4 lg:px-6 border-2 border-solid border-dark dark:border-light rounded mr-2 lg:mr-4 mb-2 lg:mb-4 hover:scale-105 transition-all ease duration-200 cursor-pointer bg-accent/60 dark:bg-accentDark dark:font-semibold text-light dark:text-dark"
                        >
                            <span className="text-lg lg:text-xl">{item.icon}</span>
                            {item.name}
                        </li>
                    );
                })}
            </ul>

            {/* Back-End Technologies */}
            <h3 className="ml-12 sm:ml-20 md:ml-24">
                <span className="inline-block bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
                    Back-End Technologies
                </span>
            </h3>
            <ul className="flex flex-wrap mt-4 justify-center">
                {backTech.map((item, index) => {
                    return (
                        <li
                            key={index}
                            className="flex items-center gap-2 font-semibold capitalize text-sm lg:text-lg py-2 lg:py-5 px-4 lg:px-6 border-2 border-solid border-dark dark:border-light rounded mr-2 lg:mr-4 mb-2 lg:mb-4 hover:scale-105 transition-all ease duration-200 cursor-pointer bg-accent/60 dark:bg-accentDark dark:font-semibold text-light dark:text-dark"
                        >
                            <span className="text-lg lg:text-xl">{item.icon}</span>
                            {item.name}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default Skills;
