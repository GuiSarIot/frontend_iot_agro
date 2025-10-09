'use client'

import { useContext, ReactNode } from 'react'

import Image from 'next/image'

import AppContext from '@/context/appContext'
import logo from '@/public/Logo.png'

import StylesLoaders from './loader.module.css'

interface LoaderProps {
    children: ReactNode
}

const Loader: React.FC<LoaderProps> = ({ children }) => {
    const { appState } = useContext(AppContext.Context)
    const { isLoading } = appState

    return (
        <div className={StylesLoaders.page}>
            {isLoading && (
                <div className={StylesLoaders.pageLoader}>
                    <div className={StylesLoaders.backgroundDots}></div>

                    <div className={StylesLoaders.container}>
                        <div className={StylesLoaders.spinner}></div>
                        <div className={StylesLoaders.logoWrapper}>
                            <Image
                                src={logo}
                                alt="Logo IOTCorp SAS"
                                className={StylesLoaders.logo}
                                width={100}
                                height={100}
                                priority
                            />
                        </div>
                    </div>

                    <div className={StylesLoaders.text}>Cargando...</div>
                </div>
            )}
            {children}
        </div>
    )
}

export default Loader
