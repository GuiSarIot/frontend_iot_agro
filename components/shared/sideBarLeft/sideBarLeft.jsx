'use client'

import { useContext } from 'react'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import Image from 'next/image'
import LogoSena from '@/images/logos/logo_sena.png'
import Logo_sava from '@/images/logos/logo_sena_sava.png'
import stylesSideBar from './sideBarLeft.module.css'

const SideBarLeft = ({children}) => {

    //* context
    const { appState, showNavbar } = useContext(AppContext.Context)
    const { navBarState } = appState

    //* styles
    const sideBarLeft = navBarState ? `${stylesSideBar.sideBarLeft} ${stylesSideBar.active}` : stylesSideBar.sideBarLeft

    //* methods
    const handleClick = () => {
        showNavbar(false)
    }

    return (
        <>
            <div className={sideBarLeft}>
                <div className={stylesSideBar.boxImage}>
                    <Image src={LogoSena} alt="logo sena" />
                    <Image src={Logo_sava} alt="logo sava" />
                </div>
                <ul className={stylesSideBar.sideBarList}>
                    {children}
                </ul>
            </div>
            <div 
                className={stylesSideBar.overlay} 
                onMouseDown={handleClick}
                onMouseUp={handleClick}
                onTouchStart={handleClick}
            ></div>
        </>
    )
}

SideBarLeft.propTypes = {
    children: PropTypes.node.isRequired
}

export default SideBarLeft