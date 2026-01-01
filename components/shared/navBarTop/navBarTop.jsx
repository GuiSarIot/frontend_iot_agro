'use client'

import { useContext, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import PersonIcon from '@mui/icons-material/Person'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import DevicesIcon from '@mui/icons-material/Devices'
import SensorsIcon from '@mui/icons-material/Sensors'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import RouterIcon from '@mui/icons-material/Router'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import CodeIcon from '@mui/icons-material/Code'
import Image from 'next/image'

import AppContext from '@/context/appContext'
import { MODULES_CONFIG } from '@/components/shared/layout/modulesConfig'

import stylesNavBarTop from './navBarTop.module.css'
import ProfilePopup from './profilePopup/profilePopup'
import GetProfileImage from './profilePopup/getProfileImage'

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
    
    // Obtener módulos disponibles basados en permisos del usuario
    const getAvailableModules = () => {
        const permissions = Array.isArray(userPermissions) ? userPermissions : []
        
        return Object.entries(MODULES_CONFIG)
            .filter(([_, config]) => {
                if (config.permissions.length === 0) return true
                return config.permissions.some(permission => permissions.includes(permission))
            })
            .sort((a, b) => a[1].priority - b[1].priority)
            .slice(0, 6) // Mostrar máximo 6 módulos en el navbar
    }
    
    const availableModules = getAvailableModules()
    
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
                {availableModules.map(([key, config]) => (
                    <button
                        key={key}
                        className={`${stylesNavBarTop.moduleButton} ${
                            isActiveModule(config.href) ? stylesNavBarTop.activeModule : ''
                        }`}
                        onClick={() => handleModuleClick(config.href)}
                        title={config.label}
                        aria-label={config.label}
                    >
                        {config.icon}
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