'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import ComputerIcon from '@mui/icons-material/Computer'
import Swal from 'sweetalert2'

import { auditLogsService, type AuditLog } from '@/app/services/api.service'
import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import stylesPage from './detailPage.module.css'

interface AuditLogDetailPageProps {
    params: {
        id: string
    }
}

const AuditLogDetailPage: React.FC<AuditLogDetailPageProps> = ({ params }) => {
    const router = useRouter()
    const { changeTitle, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const [log, setLog] = useState<AuditLog | null>(null)

    useEffect(() => {
        showLoader(true)
        changeTitle('Detalle de Log de Auditoría')
        SaveRoute({
            routeInfo: `/gestor_logs/audit/${params.id}`,
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

            const logData = await auditLogsService.getById(Number(params.id))
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

    const getActionBadgeClass = (action: string) => {
        switch (action) {
            case 'CREATE': return stylesPage.badgeCreate
            case 'UPDATE': return stylesPage.badgeUpdate
            case 'DELETE': return stylesPage.badgeDelete
            default: return stylesPage.badge
        }
    }

    if (!log) {
        return (
            <div className={stylesPage.containerPage}>
                <div className={stylesPage.loadingState}>
                    <HistoryIcon style={{ fontSize: '4rem', color: 'var(--neutral-400)' }} />
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
                            <HistoryIcon className={stylesPage.titleIcon} />
                            <h1 className={stylesPage.pageTitle}>Detalle de Log de Auditoría</h1>
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
                                <span className={stylesPage.infoLabel}>Acción:</span>
                                <span className={`${stylesPage.badge} ${getActionBadgeClass(log.action)}`}>
                                    {log.action}
                                </span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Fecha y Hora:</span>
                                <span className={stylesPage.infoValue}>{formatDate(log.timestamp)}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Modelo:</span>
                                <span className={stylesPage.infoValue}>{log.model_name}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Object ID:</span>
                                <span className={stylesPage.infoValue}>#{log.object_id}</span>
                            </div>
                            <div className={stylesPage.infoItem}>
                                <span className={stylesPage.infoLabel}>Representación:</span>
                                <span className={stylesPage.infoValue}>{log.object_repr}</span>
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

                    {/* Cambios Realizados */}
                    {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className={stylesPage.infoCard}>
                            <h2 className={stylesPage.sectionTitle}>Cambios Realizados</h2>
                            <div className={stylesPage.changesContainer}>
                                {Object.entries(log.changes).map(([field, change]) => (
                                    <div key={field} className={stylesPage.changeCard}>
                                        <div className={stylesPage.changeField}>{field}</div>
                                        <div className={stylesPage.changeComparison}>
                                            <div className={stylesPage.changeColumn}>
                                                <div className={stylesPage.changeLabel}>Valor Anterior</div>
                                                <div className={stylesPage.oldValue}>
                                                    <pre>{JSON.stringify(change.old, null, 2)}</pre>
                                                </div>
                                            </div>
                                            <div className={stylesPage.changeArrow}>→</div>
                                            <div className={stylesPage.changeColumn}>
                                                <div className={stylesPage.changeLabel}>Valor Nuevo</div>
                                                <div className={stylesPage.newValue}>
                                                    <pre>{JSON.stringify(change.new, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuditLogDetailPage
