import { backTech, frontTech } from "@/data/tech";

const Skills = () => {
    return (
        <section className="w-full flex flex-col p-5 xs:p-10 sm:p-12 md:p-16 lg:p-20 border-b-2 border-solid border-dark dark:border-light text-dark dark:text-light">
            <span className="font-semibold text-lg sm:text-3xl md:text-4xl text-accent dark:text-accentDark">
                I'm comfortable working with...
            </span>
            <h3 className="ml-24">
                <span className="inline-block bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
                    Front-End Technologies
                </span>
            </h3>
            <ul className="flex flex-wrap mt-4 justify-center xs:justify-start">
                {frontTech.map((item, index) => {
                    return (
                        <li
                            key={index}
                            className="flex items-center gap-1 font-semibold capitalize text-base xs:text-lg dark:text-dark dark:text sm:text-xl md:text-2xl py-2 xs:py-3 sm:py-4 lg:py-5 px-4 xs:px-6 sm:px-8 lg:px-12 border-2 border-solid border-dark dark:border-light rounded mr-3 mb-3 xs:mr-4 xs:mb-4 md:mr-6 md:mb-6 hover:scale-105 transition-all ease duration-200 cursor-pointer dark:font-semibold bg-accent/60 dark:bg-accentDark"
                        >
                            <span className="text-2xl">{item.icon}</span>{item.name}
                        </li>
                    );
                })}
            </ul>
            <h3 className="ml-24">
                <span className="inline-block bg-gradient-to-r from-accent to-accent dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
                    Back-End Technologies
                </span>
            </h3>
            <ul className="flex flex-wrap mt-4 justify-center xs:justify-start">
                {backTech.map((item, index) => {
                    return (
                        <li
                            key={index}
                            className="flex items-center gap-1 font-semibold capitalize text-base xs:text-lg dark:text-dark dark:text sm:text-xl md:text-2xl py-2 xs:py-3 sm:py-4 lg:py-5 px-4 xs:px-6 sm:px-8 lg:px-12 border-2 border-solid border-dark dark:border-light rounded mr-3 mb-3 xs:mr-4 xs:mb-4 md:mr-6 md:mb-6 hover:scale-105 transition-all ease duration-200 cursor-pointer dark:font-semibold bg-accent/60 dark:bg-accentDark"
                        >
                            {item.icon}{item.name}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default Skills;
