import React from 'react'

function InsightBanner({ insights }) {
    return (
        <div className="w-full bg-accent rounded dark:bg-accentDark text-light dark:text-dark whitespace-nowrap overflow-hidden">
            <div className="animate-roll md:py-6 md:text-2xl w-full py-2 sm:py-3 flex items-center justify-center capitalize font-semibold tracking-wider text-sm sm:text-base">
                {
                    insights?.map((text, index) =>
                        <div key={index} className='text-light dark:text-dark'>{text}
                            <span className='px-4'>|</span>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default InsightBanner