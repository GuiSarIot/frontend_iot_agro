'use client'

import { useContext } from 'react'

import MenuIcon from '@mui/icons-material/Menu'

import SearchBar from '@/components/shared/searchBar/searchBar'
import AppContext from '@/context/appContext'

import stylesNavBarTop from './navBarTop.module.css'
import ProfilePopup from './profilePopup/profilePopup'

const NavBarTop = () => {

    //* context
    const { appState, showNavbar } = useContext(AppContext.Context)
    const { navBarState, userInfo } = appState
    const { nameImage, roles, name: userName } = userInfo

    //* methods
    const handleClick = () => {
        showNavbar(!navBarState)
    }

    //* renders
    return (
        <div className={stylesNavBarTop.navBarTop}>
            <div className={stylesNavBarTop.burguerButtton}>
                <button onClick={handleClick} >
                    <MenuIcon />
                </button>
            </div>
            <div className={stylesNavBarTop.searchBar}>
                <SearchBar roles={roles} />
            </div>
            <div className="userInfo">
                <ProfilePopup nameImage={nameImage}  />
            </div>
            <div className={stylesNavBarTop.userInfo}>
                <div className={stylesNavBarTop.name}>
                    <span>{userName}</span>
                </div>
            </div>
        </div>
    )
}

export default NavBarTop