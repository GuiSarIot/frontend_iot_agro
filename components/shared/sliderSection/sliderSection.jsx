import React, { useState } from 'react'
import Slider from 'react-slick'
import Image from 'next/image'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const SliderSection = () => {
    const [images] = useState([
        '/banners-login/slider.png',
        '/banners-login/slider.png',
        '/banners-login/slider.png'
    ])

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    }

    return (
        <div>
            <Slider {...settings}>
                {images.map((src, index) => (
                    <div key={index} className="slide">
                        <Image
                            src={src}
                            alt={`Slide ${index}`}
                            layout='intrinsic'
                            width={1900}
                            height={800}
                            className='mx-auto'
                        />
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default SliderSection
