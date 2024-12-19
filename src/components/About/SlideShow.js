'use client'

import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';

function SlideShow({ items, renderItem }) {
    return (
        <div className="h-full m-auto">
            <Carousel
                NextIcon={<BiArrowToRight className="text-4xl text-white " />}
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
