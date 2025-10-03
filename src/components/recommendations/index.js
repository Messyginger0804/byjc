'use client';

import React from "react";
import Image from "next/image";
import recommendations from "@/data/recommendations";

const Recommendations = () => {
    return (
        <section className="w-full flex flex-col p-5 xs:p-10 sm:p-12 md:p-16 lg:p-20 text-dark dark:text-light">
            <h2 className="font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-center text-accent dark:text-accentDark mb-8">
                Recommendations
            </h2>
            <div className="flex flex-col gap-8">
                {recommendations.map((recommendation, index) => (
                    <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start bg-accent/20 dark:bg-accentDark/20 p-6 rounded-lg shadow-lg"
                    >
                        {/* Left Side: Image and Info */}
                        <div className="flex flex-col items-center sm:items-start sm:w-1/3">
                            <a
                                href={recommendation.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src={recommendation.image}
                                    alt={recommendation.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-full mb-4 sm:mb-2 border-2 border-accent dark:border-accentDark"
                                />
                            </a>
                            <a
                                href={recommendation.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg font-bold text-accent dark:text-accentDark text-center sm:text-left hover:underline"
                            >
                                {recommendation.name}
                            </a>
                            <p className="text-sm text-dark dark:text-light font-semibold text-center sm:text-left mb-1">
                                {recommendation.position}, {recommendation.company}
                            </p>
                            <p className="text-sm text-dark dark:text-light italic text-center sm:text-left">
                                {recommendation.relationship} | {recommendation.date}
                            </p>
                        </div>

                        {/* Right Side: Recommendation Text */}
                        <div className="sm:w-2/3 sm:pl-6">
                            <p className="text-sm text-dark dark:text-light leading-relaxed">
                                "{recommendation.text}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Recommendations;
