'use client'

import { useEffect } from 'react'

import DashboardIcon from '@mui/icons-material/Dashboard'

import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './dashboard.module.css'

const DashboardPage: React.FC = () => {
    const { changeTitle, showNavbar, showLoader } = useAppContext()

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Panel de Control')
        showLoader(false)
    }, [changeTitle, showNavbar, showLoader])

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.dashboardContainer}>
                <div className={styles.welcomeSection}>
                    <DashboardIcon className={styles.icon} />
                    <h1>Bienvenido al Sistema IOTCorp</h1>
                    <p>
                        Utiliza el menú lateral para navegar entre los diferentes módulos del sistema.
                    </p>
                </div>

                <div className={styles.infoSection}>
                    <h2>Módulos Disponibles</h2>
                    <p>
                        Los módulos mostrados en el menú lateral dependen de tus permisos y rol en el sistema.
                        Si no ves algún módulo, contacta al administrador del sistema.
                    </p>
                </div>
            </div>
        </AppLayout>
    )
}

export default DashboardPage
