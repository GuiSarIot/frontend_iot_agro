'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import ComputerIcon from '@mui/icons-material/Computer'
import SpeedIcon from '@mui/icons-material/Speed'
import Swal from 'sweetalert2'

import { accessLogsService, type AccessLog } from '@/app/services/api.service'
import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import stylesPage from './detailPage.module.css'

interface AccessLogDetailPageProps {
    params: {
        id: string
    }
}

const AccessLogDetailPage: React.FC<AccessLogDetailPageProps> = ({ params }) => {
    const router = useRouter()
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const [log, setLog] = useState<AccessLog | null>(null)

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Detalle de Log de Acceso')
        SaveRoute({
            routeInfo: `/gestor_logs/access/${params.id}`,
            title: 'Detalle de Log',
            role: 'Gestión de logs'
        })
        changeUserInfo({
            ...userInfo,
            role: 'Gestión de logs'
        })
        loadLogDetail()
        // eslint-disable-next-line
    }, [params.id])

    const loadLogDetail = async () => {
        try {
            const { token } = await GetRoute()
            
            if (!token || token === 'false') {
                console.error('Token no disponible')
                showLoader(false)
                router.push('/gestor_logs')
                return
            }

            const logData = await accessLogsService.getById(Number(params.id))
            setLog(logData)
            showLoader(false)

        } catch (error) {
            console.error('Error al cargar log:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar el log',
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then(() => {
                router.push('/gestor_logs')
            })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date)
    }

    const getMethodBadgeClass = (method: string) => {
        switch (method) {
            case 'GET': return stylesPage.badgeGet
            case 'POST': return stylesPage.badgePost
            case 'PUT': return stylesPage.badgePut
            case 'PATCH': return stylesPage.badgePatch
            case 'DELETE': return stylesPage.badgeDelete
            default: return stylesPage.badge
        }
    }

    const getStatusBadgeClass = (status: number) => {
        if (status >= 200 && status < 300) return stylesPage.badgeSuccess
        if (status >= 400 && status < 500) return stylesPage.badgeWarning
        if (status >= 500) return stylesPage.badgeError
        return stylesPage.badge
    }

    if (!log) {
        return (
            <div className={stylesPage.containerPage}>
                <div className={stylesPage.loadingState}>
                    <LockIcon style={{ fontSize: '4rem', color: 'var(--neutral-400)' }} />
                    <h3>Cargando log...</h3>
                </div>
            </div>
        )
    }

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <button onClick={() => router.push('/gestor_logs')} className={stylesPage.btnBack}>
                        <ArrowBackIcon />
                        <span>Volver a logs</span>
                    </button>
                    <div className={stylesPage.titleSection}>
                        <div className={stylesPage.titleWrapper}>
                            <LockIcon className={stylesPage.titleIcon} />
                            <h1 className={stylesPage.pageTitle}>Detalle de Log de Acceso</h1>
                        </div>
                        <p className={stylesPage.pageSubtitle}>
                            ID: #{log.id}
                        </p>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className={stylesPage.contentSection}>
                    {/* Información General */}
                    <div className={stylesPage.infoCard}>
                        <h2 className={stylesPage.sectionTitle}>Información General</h2>
                        <div className={stylesPage.infoGrid}>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Método HTTP:</span>
                                <span className={`${stylesPage.badge} ${getMethodBadgeClass(log.method)}`}>
                                    {log.method}
                                </span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Status Code:</span>
                                <span className={`${stylesPage.badge} ${getStatusBadgeClass(log.status_code)}`}>
                                    {log.status_code}
                                </span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Fecha y Hora:</span>
                                <span className={stylesPage.infoValue}>{formatDate(log.timestamp)}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Módulo:</span>
                                <span className={stylesPage.infoValue}>{log.module}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Endpoint:</span>
                                <span className={stylesPage.infoValueCode}>{log.endpoint}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información del Usuario */}
                    <div className={stylesPage.infoCard}>
                        <h2 className={stylesPage.sectionTitle}>
                            <PersonIcon style={{ marginRight: '0.5rem' }} />
                            Información del Usuario
                        </h2>
                        <div className={stylesPage.infoGrid}>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Usuario:</span>
                                <span className={stylesPage.infoValue}>{log.username}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>User ID:</span>
                                <span className={stylesPage.infoValue}>#{log.user}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rendimiento */}
                    <div className={stylesPage.infoCard}>
                        <h2 className={stylesPage.sectionTitle}>
                            <SpeedIcon style={{ marginRight: '0.5rem' }} />
                            Información de Rendimiento
                        </h2>
                        <div className={stylesPage.performanceCard}>
                            <div className={stylesPage.performanceMetric}>
                                <div className={stylesPage.metricLabel}>Tiempo de Respuesta</div>
                                <div className={stylesPage.metricValue}>{log.response_time_ms.toFixed(2)} ms</div>
                            </div>
                        </div>
                    </div>

                    {/* Información Técnica */}
                    <div className={stylesPage.infoCard}>
                        <h2 className={stylesPage.sectionTitle}>
                            <ComputerIcon style={{ marginRight: '0.5rem' }} />
                            Información Técnica
                        </h2>
                        <div className={stylesPage.infoGrid}>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Dirección IP:</span>
                                <span className={stylesPage.infoValue}>{log.ip_address}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>User Agent:</span>
                                <span className={stylesPage.infoValueFull}>{log.user_agent}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccessLogDetailPage
