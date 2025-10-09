'use client'

import { useContext, ReactNode } from 'react'

import Image from 'next/image'

import AppContext from '@/context/appContext'
import LogoIotCorpSas from '@/images/logos/LogoIOTCorpSAS.png'


import stylesSideBar from './sideBarLeft.module.css'

interface SideBarLeftProps {
    children: ReactNode
}

const SideBarLeft: React.FC<SideBarLeftProps> = ({ children }) => {
    // Context
    const { appState, showNavbar } = useContext(AppContext.Context)
    const { navBarState } = appState

    // Styles
    const sideBarLeft = navBarState
        ? `${stylesSideBar.sideBarLeft} ${stylesSideBar.active}`
        : stylesSideBar.sideBarLeft

    // Handlers
    const handleClick = () => {
        showNavbar(false)
    }

    return (
        <>
            <div className={sideBarLeft}>
                <div className={stylesSideBar.boxImage}>
                    <Image src={LogoIotCorpSas} alt="Logo IOTCorpSAS" />
                </div>
                <ul className={stylesSideBar.sideBarList}>{children}</ul>
            </div>

            <div
                className={stylesSideBar.overlay}
                onMouseDown={handleClick}
                onMouseUp={handleClick}
                onTouchStart={handleClick}
            />
        </>
    )
}

export default SideBarLeft
