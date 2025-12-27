'use client'

import { useContext, ReactNode } from 'react'

import Image from 'next/image'

import AppContext from '@/context/appContext'

import stylesSideBar from './sideBarLeft.module.css'

interface SideBarLeftProps {
    children: ReactNode
}

const SideBarLeft: React.FC<SideBarLeftProps> = ({ children }) => {
    // Context
    const { appState, showNavbar } = useContext(AppContext.Context)
    const { navBarState, sidebarCollapsed } = appState

    // Styles
    const sideBarLeft = `${stylesSideBar.sideBarLeft} ${
        navBarState ? stylesSideBar.active : ''
    } ${sidebarCollapsed ? stylesSideBar.collapsed : ''}`

    // Handlers
    const handleClick = () => {
        showNavbar(false)
    }

    return (
        <>
            <div className={sideBarLeft}>
                <div className={stylesSideBar.boxImage}>
                    <Image 
                        src="/api/get_file?folder=images/logos&file=LogoIOTCorpSAS.png" 
                        alt="Logo IOTCorpSAS"
                        width={150}
                        height={50}
                        unoptimized
                    />
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
