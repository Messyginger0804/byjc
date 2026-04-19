'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';

const Carousel = dynamic(() => import('react-material-ui-carousel'), { ssr: false });

function SlideShow({ items, renderItem }) {
    return (
        <div className="w-1/2 mx-auto ">
            <Carousel
                NextIcon={<BiArrowToRight className="text-4xl text-white" />}
                PrevIcon={<BiArrowToLeft className="text-4xl text-white" />}
            >
                {items.map((item, index) => (
                    <div key={index} className='flex justify-center gap-3'>
                        {renderItem(item)}
                    </div>
                ))}
            </Carousel>
        </div>
    );
}

export default SlideShow;
