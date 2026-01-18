'use client'

import { useState, useEffect, ReactElement } from 'react'

import { useRouter } from 'next/navigation'

import DevicesIcon from '@mui/icons-material/Devices'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import PeopleIcon from '@mui/icons-material/People'
import RouterIcon from '@mui/icons-material/Router'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import ShieldIcon from '@mui/icons-material/Shield'
import VpnKeyIcon from '@mui/icons-material/VpnKey'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import stylesPage from './mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface MqttModule {
    title: string
    description: string
    icon: ReactElement
    href: string
    permissions: string[]
}

interface ManageMqttPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageMqttPage: React.FC<ManageMqttPageProps> = ({
    infoPage = {
        title: 'MQTT',
        route: '/gestor_mqtt',
        role: 'Gestión de MQTT'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const router = useRouter()

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'mqtt',
        action: 'list'
    })

    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (!isInitialized) {
            showLoader(true)
            showNavbar(window.innerWidth > 1380)
            changeTitle(infoPage.title)
            SaveRoute({
                routeInfo: infoPage.route,
                title: infoPage.title,
                role: infoPage.role
            })
            changeUserInfo({
                ...userInfo,
                role: infoPage.role
            })
            setIsInitialized(true)
            showLoader(false)
        }
        // eslint-disable-next-line
    }, [])

    const mqttModules: MqttModule[] = [
        {
            title: 'Brokers MQTT',
            description: 'Gestión de brokers MQTT para la comunicación de dispositivos',
            icon: <RouterIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/brokers',
            permissions: ['gestionar_mqtt', 'ver_mqtt']
        },
        {
            title: 'Credenciales MQTT',
            description: 'Administración de credenciales de autenticación para MQTT',
            icon: <VpnKeyIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/credentials',
            permissions: ['gestionar_mqtt', 'ver_credenciales_mqtt']
        },
        {
            title: 'Topics MQTT',
            description: 'Configuración de topics para la publicación y suscripción de mensajes',
            icon: <SettingsSuggestIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/topics',
            permissions: ['gestionar_mqtt', 'ver_mqtt']
        },
        {
            title: 'Config. Dispositivos',
            description: 'Configuración MQTT específica por dispositivo',
            icon: <DevicesIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/device_config',
            permissions: ['gestionar_mqtt', 'ver_dispositivos']
        },
        {
            title: 'Usuarios EMQX',
            description: 'Gestión de usuarios del broker EMQX',
            icon: <PeopleIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/users',
            permissions: ['gestionar_mqtt', 'is_superuser']
        },
        {
            title: 'ACL EMQX',
            description: 'Control de acceso a topics y recursos MQTT',
            icon: <ShieldIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/acl',
            permissions: ['gestionar_mqtt', 'is_superuser']
        },
        {
            title: 'Utilidades MQTT',
            description: 'Probar conexiones y verificar estado de dispositivos',
            icon: <NetworkCheckIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/utilities',
            permissions: ['gestionar_mqtt', 'ver_mqtt']
        },
        {
            title: 'Simuladores MQTT',
            description: 'Probar comandos MQTT en dispositivos IoT en tiempo real',
            icon: <DevicesIcon sx={{ fontSize: 48 }} />,
            href: '/gestor_mqtt/simulators',
            permissions: ['gestionar_mqtt', 'ver_dispositivos', 'ver_mqtt']
        }
    ]

    // Filtrar módulos según permisos del usuario
    const availableModules = mqttModules.filter(module => {
        if (module.permissions.length === 0) return true
        return module.permissions.some(permission => 
            Array.isArray(userInfo.roles) && userInfo.roles.includes(permission)
        )
    })

    const handleModuleClick = (href: string) => {
        router.push(href)
    }

    return (
        <div className={stylesPage.containerPage}>
            {/* Main Card Container */}
            <div className={stylesPage.mainCard}>
                {/* Page Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.titleSection}>
                        <RouterIcon className={stylesPage.titleIcon} />
                        <div>
                            <h1 className={stylesPage.pageTitle}>Gestión de MQTT</h1>
                            <p className={stylesPage.pageSubtitle}>
                                Administra y configura todos los componentes MQTT del sistema
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className={stylesPage.contentArea}>
                    {/* Section Title */}
                    <div className={stylesPage.sectionHeader}>
                        <h2 className={stylesPage.sectionTitle}>Módulos disponibles</h2>
                        <span className={stylesPage.moduleCount}>
                            {availableModules.length} {availableModules.length === 1 ? 'módulo' : 'módulos'}
                        </span>
                    </div>

                    {/* Modules Grid */}
                    {availableModules.length > 0 ? (
                        <div className={stylesPage.modulesGrid}>
                            {availableModules.map((module, index) => (
                                <div 
                                    key={index}
                                    className={stylesPage.moduleCard}
                                    onClick={() => handleModuleClick(module.href)}
                                >
                                    <div className={stylesPage.cardContent}>
                                        <div className={stylesPage.moduleIconWrapper}>
                                            {module.icon}
                                        </div>
                                        <div className={stylesPage.moduleInfo}>
                                            <h3 className={stylesPage.moduleTitle}>{module.title}</h3>
                                            <p className={stylesPage.moduleDescription}>{module.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={stylesPage.emptyState}>
                            <ShieldIcon className={stylesPage.emptyIcon} />
                            <p className={stylesPage.emptyText}>
                                No tienes permisos para acceder a ningún módulo MQTT
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageMqttPage
