'use client';

import React from "react";
import recommendations from "@/data/recommendations";

const Recommendations = () => {
    return (
        <section className="w-full flex flex-col p-5 xs:p-10 sm:p-12 md:p-16 lg:p-20 text-dark dark:text-light">
            <h2 className="font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-center text-accent dark:text-accentDark mb-8">
                Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((recommendation, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center bg-accent/20 dark:bg-accentDark/20 p-6 rounded-lg shadow-lg"
                    >
                        <img
                            src={recommendation.image}
                            alt={recommendation.name}
                            className="w-20 h-20 rounded-full mb-4 border-2 border-accent dark:border-accentDark"
                        />
                        <h3 className="text-lg font-bold text-accent dark:text-accentDark">
                            {recommendation.name}
                        </h3>
                        <p className="text-sm text-dark dark:text-light font-semibold mb-4">
                            {recommendation.position}
                        </p>
                        <p className="text-sm text-center text-dark dark:text-light leading-relaxed">
                            "{recommendation.text}"
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Recommendations;
