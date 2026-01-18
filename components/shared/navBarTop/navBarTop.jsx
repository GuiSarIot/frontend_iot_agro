'use client'

import { useContext, useState } from 'react'

import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import PersonIcon from '@mui/icons-material/Person'

import { getNavbarModules } from '@/components/shared/layout/modulesConfig'
import AppContext from '@/context/appContext'

import stylesNavBarTop from './navBarTop.module.css'
import GetProfileImage from './profilePopup/getProfileImage'
import ProfilePopup from './profilePopup/profilePopup'

const NavBarTop = () => {

    //* context
    const { appState, toggleSidebarCollapse, toggleTheme } = useContext(AppContext.Context)
    const { sidebarCollapsed, theme, userInfo } = appState
    const { nameImage, name: userName, roles: userPermissions } = userInfo
    
    const router = useRouter()
    const pathname = usePathname()

    //* states
    const [showProfile, setShowProfile] = useState(false)
    const [imageError, setImageError] = useState(false)

    //* methods
    const handleToggleSidebar = () => {
        toggleSidebarCollapse()
    }

    const handleToggleProfile = () => {
        setShowProfile(!showProfile)
    }
    
    const handleModuleClick = (href) => {
        router.push(href)
    }
    
    // Obtener módulos disponibles basados en permisos y rol del usuario
    const permissions = Array.isArray(userPermissions) ? userPermissions : []
    const availableModules = getNavbarModules(permissions, userInfo)
    
    // Verificar si la ruta actual corresponde a un módulo
    const isActiveModule = (href) => {
        return pathname === href || pathname?.startsWith(href + '/')
    }

    // Obtener imagen de perfil
    const profileImage = GetProfileImage(nameImage)

    // Clase dinámica para el navbar según estado del sidebar
    const navBarClass = sidebarCollapsed 
        ? `${stylesNavBarTop.navBarTop} ${stylesNavBarTop.collapsed}`
        : stylesNavBarTop.navBarTop

    //* renders
    return (
        <div className={navBarClass}>
            <div className={stylesNavBarTop.leftSection}>
                <button 
                    className={stylesNavBarTop.toggleButton} 
                    onClick={handleToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </button>
            </div>
            
            <div className={stylesNavBarTop.modulesNav}>
                {availableModules.map((module) => (
                    <button
                        key={module.href}
                        className={`${stylesNavBarTop.moduleButton} ${
                            isActiveModule(module.href) ? stylesNavBarTop.activeModule : ''
                        }`}
                        onClick={() => handleModuleClick(module.href)}
                        title={module.label}
                        aria-label={module.label}
                    >
                        {module.icon}
                    </button>
                ))}
            </div>
            
            <div className={stylesNavBarTop.rightSection}>
                <button 
                    className={stylesNavBarTop.themeToggle} 
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                >
                    {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                </button>
                
                <div className={stylesNavBarTop.userInfo} onClick={handleToggleProfile}>
                    <div className={stylesNavBarTop.boxImage}>
                        {imageError ? (
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                backgroundColor: '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#757575'
                            }}>
                                <PersonIcon style={{ fontSize: '24px' }} />
                            </div>
                        ) : (
                            <Image 
                                src={profileImage}
                                alt={userName || 'Usuario'}
                                width={40}
                                height={40}
                                onError={() => setImageError(true)}
                            />
                        )}
                    </div>
                    <ProfilePopup 
                        nameImage={nameImage} 
                        showProfile={showProfile} 
                        setShowProfile={setShowProfile}
                    />
                </div>
            </div>
        </div>
    )
}

export default NavBarTop