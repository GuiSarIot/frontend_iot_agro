'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DevicesIcon from '@mui/icons-material/Devices'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PeopleIcon from '@mui/icons-material/People'
import RouterIcon from '@mui/icons-material/Router'
import SensorsIcon from '@mui/icons-material/Sensors'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

import useAccessLogger from '@/app/hooks/useAccessLogger'
import { isSuperUser } from '@/app/utils/permissions'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './dashboard.module.css'

interface QuickAccessItem {
    icon: React.ReactNode
    title: string
    description: string
    href: string
    color: string
    requireSuperUser?: boolean
}

const DashboardPage: React.FC = () => {
    const { changeTitle, showNavbar, showLoader, appState } = useAppContext()
    const { userInfo } = appState
    const router = useRouter()
    const [currentTime, setCurrentTime] = useState(new Date())

    const isUserSuperUser = isSuperUser(userInfo)

    // Registrar acceso al dashboard
    useAccessLogger({ 
        customModule: 'other',
        action: 'view'
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Panel de Control')
        showLoader(false)

        // Actualizar hora cada minuto
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Accesos rápidos disponibles
    const quickAccess: QuickAccessItem[] = [
        {
            icon: <DevicesIcon />,
            title: 'Mis Dispositivos',
            description: 'Gestiona tus dispositivos IoT',
            href: '/dashboard/portal_usuario',
            color: '#147910'
        },
        {
            icon: <AssessmentIcon />,
            title: 'Portal Admin',
            description: 'Panel de administración completo',
            href: '/dashboard/portal_admin',
            color: '#0d5e0a',
            requireSuperUser: true
        },
        {
            icon: <PeopleIcon />,
            title: 'Usuarios',
            description: 'Gestión de usuarios del sistema',
            href: '/gestor_usuarios',
            color: '#1976d2',
            requireSuperUser: true
        },
        {
            icon: <SensorsIcon />,
            title: 'Sensores',
            description: 'Configuración de sensores',
            href: '/gestor_sensores',
            color: '#9c27b0',
            requireSuperUser: true
        },
        {
            icon: <RouterIcon />,
            title: 'MQTT',
            description: 'Gestión de conexiones MQTT',
            href: '/gestor_mqtt',
            color: '#f57c00',
            requireSuperUser: true
        },
        {
            icon: <TrendingUpIcon />,
            title: 'Lecturas',
            description: 'Análisis de datos de sensores',
            href: '/gestor_lecturas',
            color: '#00897b',
            requireSuperUser: true
        }
    ]

    // Filtrar accesos según permisos
    const availableQuickAccess = quickAccess.filter(item => 
        !item.requireSuperUser || isUserSuperUser
    )

    // Noticias y actualizaciones
    const news = [
        {
            icon: <NotificationsActiveIcon />,
            title: 'Sistema actualizado',
            description: 'Nueva versión con mejoras en el rendimiento y diseño modernizado',
            date: '15 Ene 2026',
            type: 'update'
        },
        {
            icon: <DevicesIcon />,
            title: 'Nuevos dispositivos compatibles',
            description: 'Soporte agregado para sensores de última generación',
            date: '10 Ene 2026',
            type: 'feature'
        },
        {
            icon: <AssessmentIcon />,
            title: 'Dashboard mejorado',
            description: 'Estadísticas en tiempo real y nuevas visualizaciones de datos',
            date: '5 Ene 2026',
            type: 'feature'
        }
    ]

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.dashboardContainer}>
                <div className={styles.contentWrapper}>
                    {/* Hero Section */}
                    <div className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <div className={styles.greeting}>
                                <DashboardIcon className={styles.heroIcon} />
                                <h1>Bienvenido, {userInfo.first_name || userInfo.username}</h1>
                            </div>
                            <p className={styles.heroSubtitle}>
                                Sistema de Gestión IoT - Monitoreo y Control en Tiempo Real
                            </p>
                            <div className={styles.dateTime}>
                                <AccessTimeIcon />
                                <span>{formatTime(currentTime)} • {formatDate(currentTime)}</span>
                            </div>
                        </div>
                        <div className={styles.heroStats}>
                            <div className={styles.statBadge}>
                                <span className={styles.statLabel}>Rol</span>
                                <span className={styles.statValue}>
                                    {isUserSuperUser ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Acceso Rápido</h2>
                        <p>Accede directamente a los módulos principales del sistema</p>
                    </div>
                    <div className={styles.quickAccessGrid}>
                        {availableQuickAccess.map((item, index) => (
                            <div 
                                key={index}
                                className={styles.quickAccessCard}
                                onClick={() => router.push(item.href)}
                                style={{ '--accent-color': item.color } as React.CSSProperties}
                            >
                                <div className={styles.cardIcon} style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* News Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Novedades y Actualizaciones</h2>
                        <p>Mantente informado sobre las últimas mejoras del sistema</p>
                    </div>
                    <div className={styles.newsGrid}>
                        {news.map((item, index) => (
                            <div key={index} className={styles.newsCard}>
                                <div className={styles.newsIcon}>
                                    {item.icon}
                                </div>
                                <div className={styles.newsContent}>
                                    <div className={styles.newsHeader}>
                                        <h3>{item.title}</h3>
                                        <span className={styles.newsDate}>{item.date}</span>
                                    </div>
                                    <p>{item.description}</p>
                                    <span className={`${styles.newsType} ${styles[item.type]}`}>
                                        {item.type === 'update' ? 'Actualización' : 'Nueva Función'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Footer */}
                <div className={styles.infoFooter}>
                    <div className={styles.infoCard}>
                        <h3>🔐 Seguridad</h3>
                        <p>
                            Tu cuenta está protegida. Revisa regularmente tu actividad y 
                            mantén tus credenciales seguras.
                        </p>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>📊 Análisis</h3>
                        <p>
                            Accede a estadísticas detalladas y reportes personalizados de 
                            todos tus dispositivos.
                        </p>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>🌐 Conectividad</h3>
                        <p>
                            Gestiona conexiones MQTT, configura alertas y monitorea el 
                            estado de tus dispositivos en tiempo real.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </AppLayout>
    )
}

export default DashboardPage
