'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import Slider, { Settings } from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const SliderSection: React.FC = () => {
    // Tipamos el array de imágenes como string[]
    const [images] = useState<string[]>([
        '/banners-login/slider.png',
        '/banners-login/slider.png',
        '/banners-login/slider.png',
    ])

    // Tipamos la configuración con la interfaz `Settings` de react-slick
    const settings: Settings = {
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
                            width={1900}
                            height={800}
                            className="mx-auto"
                            priority
                        />
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default SliderSection
