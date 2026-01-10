'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AssessmentIcon from '@mui/icons-material/Assessment'
import ComputerIcon from '@mui/icons-material/Computer'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import HistoryIcon from '@mui/icons-material/History'
import SearchIcon from '@mui/icons-material/Search'
import SpeedIcon from '@mui/icons-material/Speed'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { TabView, TabPanel } from 'primereact/tabview'
import { Line, Doughnut } from 'react-chartjs-2'
import Swal from 'sweetalert2'

import useAccessLogger from '@/app/hooks/useAccessLogger'
import { 
    auditLogsService, 
    accessLogsService,
    type AuditLog,
    type AccessLog,
    type AuditStatsResponse,
    type AccessStatsResponse
} from '@/app/services/api.service'
import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import stylesPage from './mainPage.module.css'

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler)

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageLogsPageProps {
    infoPage?: InfoPage
}

// ---- Funciones de utilidad ----
const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin datos',
            text: 'No hay datos para exportar',
            confirmButtonText: 'Ok'
        })
        return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header]
                if (typeof value === 'object' && value !== null) {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`
                }
                return `"${String(value).replace(/"/g, '""')}"`
            }).join(',')
        )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Swal.fire({
        icon: 'success',
        title: 'Exportado',
        text: `Archivo ${filename}.csv descargado exitosamente`,
        timer: 2000,
        showConfirmButton: false
    })
}

// ---- Componente principal ----
const ManageLogsPage: React.FC<ManageLogsPageProps> = ({
    infoPage = {
        title: 'Auditoría y Logs',
        route: '/gestor_logs',
        role: 'Gestión de logs'
    }
}) => {
    const { changeTitle, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo
    useAccessLogger({ 
        customModule: 'admin',
        action: 'view'
    })

    // Estado para Audit Logs
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [auditStats, setAuditStats] = useState<AuditStatsResponse | null>(null)
    const [auditTotalCount, setAuditTotalCount] = useState(0)
    const [auditPage, setAuditPage] = useState(1)
    const [auditFilters, setAuditFilters] = useState({
        action: '',
        model_name: '',
        username: ''
    })

    // Estado para Access Logs
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
    const [accessStats, setAccessStats] = useState<AccessStatsResponse | null>(null)
    const [accessTotalCount, setAccessTotalCount] = useState(0)
    const [accessPage, setAccessPage] = useState(1)
    const [accessFilters, setAccessFilters] = useState({
        method: '',
        status_code: '',
        module: ''
    })

    const [activeIndex, setActiveIndex] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [rowsPerPage] = useState(10)
    const [auditFirst, setAuditFirst] = useState(0)
    const [accessFirst, setAccessFirst] = useState(0)

    useEffect(() => {
        showLoader(true)
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
        loadAuditLogs()
        loadAccessLogs()
        loadStats()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeIndex === 0) {
                loadAuditLogs()
            } else {
                loadAccessLogs()
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
        // eslint-disable-next-line
    }, [searchTerm, auditFilters, accessFilters, activeIndex, auditPage, accessPage])

    const loadAuditLogs = async () => {
        try {
            const { token } = await GetRoute()
            
            if (!token || token === 'false') {
                console.error('Token no disponible')
                showLoader(false)
                return false
            }

            const params: Record<string, string | number> = { page: auditPage }
            if (auditFilters.action) params.action = auditFilters.action
            if (auditFilters.model_name) params.model_name = auditFilters.model_name
            if (auditFilters.username || searchTerm) params.username = searchTerm || auditFilters.username

            const response = await auditLogsService.getAll(params)
            
            setAuditLogs(response.results)
            setAuditTotalCount(response.count)
            showLoader(false)
            return true

        } catch (error) {
            console.error('Error al cargar logs de auditoría:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar los logs de auditoría',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return false
        }
    }

    const loadAccessLogs = async () => {
        try {
            const { token } = await GetRoute()
            
            if (!token || token === 'false') {
                console.error('Token no disponible')
                showLoader(false)
                return false
            }

            const params: Record<string, string | number> = { page: accessPage }
            if (accessFilters.method) params.method = accessFilters.method
            if (accessFilters.status_code) params.status_code = Number(accessFilters.status_code)
            if (accessFilters.module) params.module = accessFilters.module

            const response = await accessLogsService.getAll(params)
            
            setAccessLogs(response.results)
            setAccessTotalCount(response.count)
            showLoader(false)
            return true

        } catch (error) {
            console.error('Error al cargar logs de acceso:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar los logs de acceso',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return false
        }
    }

    const loadStats = async () => {
        try {
            const [auditStatsData, accessStatsData] = await Promise.all([
                auditLogsService.getStats(),
                accessLogsService.getStats()
            ])
            
            setAuditStats(auditStatsData)
            setAccessStats(accessStatsData)
        } catch (error) {
            console.error('Error al cargar estadísticas:', error)
        }
    }

    const handleExportAuditLogs = () => {
        const dataToExport = auditLogs.map(log => ({
            ID: log.id,
            Fecha: new Date(log.timestamp).toLocaleString('es-ES'),
            Usuario: log.username,
            Acción: log.action,
            Modelo: log.model_name,
            Objeto: log.object_repr,
            IP: log.ip_address,
            Cambios: JSON.stringify(log.changes)
        }))
        exportToCSV(dataToExport, 'audit_logs')
    }

    const handleExportAccessLogs = () => {
        const dataToExport = accessLogs.map(log => ({
            ID: log.id,
            Fecha: new Date(log.timestamp).toLocaleString('es-ES'),
            Usuario: log.username,
            Método: log.method,
            Endpoint: log.endpoint,
            Status: log.status_code,
            Módulo: log.module,
            'Tiempo (ms)': log.response_time_ms,
            IP: log.ip_address
        }))
        exportToCSV(dataToExport, 'access_logs')
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
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

    // Datos para gráficos
    const auditActionsChartData = {
        labels: auditStats ? Object.keys(auditStats.by_action) : [],
        datasets: [{
            label: 'Acciones de Auditoría',
            data: auditStats ? Object.values(auditStats.by_action) : [],
            backgroundColor: [
                'rgba(63, 173, 50, 0.75)',    // Verde IOTCorp
                'rgba(255, 159, 64, 0.75)',   // Naranja
                'rgba(244, 67, 54, 0.75)',    // Rojo
                'rgba(33, 150, 243, 0.75)',   // Azul
                'rgba(156, 39, 176, 0.75)'    // Morado
            ],
            borderColor: [
                'rgba(63, 173, 50, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(244, 67, 54, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(156, 39, 176, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 15,
            hoverBorderWidth: 3
        }]
    }

    const accessMethodsChartData = {
        labels: accessStats ? Object.keys(accessStats.by_method) : [],
        datasets: [{
            label: 'Métodos HTTP',
            data: accessStats ? Object.values(accessStats.by_method) : [],
            backgroundColor: 'rgba(63, 173, 50, 0.1)',
            borderColor: 'rgba(63, 173, 50, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(63, 173, 50, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(63, 173, 50, 1)',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3
        }]
    }

    // Opciones para gráfica Doughnut (sin escalas X/Y)
    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    font: {
                        size: 13,
                        weight: '500'
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: '#444'
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(63, 173, 50, 0.8)',
                borderWidth: 2,
                padding: 12,
                displayColors: true,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const dataset = context.dataset;
                        const total = dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    }

    // Opciones para gráfica Line (con escalas X/Y)
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    font: {
                        size: 13,
                        weight: '500'
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: '#444'
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(63, 173, 50, 0.8)',
                borderWidth: 2,
                padding: 12,
                displayColors: true,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context: any) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value} solicitudes`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    },
                    padding: 10
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    padding: 10
                }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false
        }
    }

    const actionOptions = [
        { label: 'Todas las acciones', value: '' },
        { label: 'Creación', value: 'CREATE' },
        { label: 'Actualización', value: 'UPDATE' },
        { label: 'Eliminación', value: 'DELETE' }
    ]

    const methodOptions = [
        { label: 'Todos los métodos', value: '' },
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' }
    ]

    const moduleOptions = [
        { label: 'Todos los módulos', value: '' },
        { label: 'Autenticación', value: 'auth' },
        { label: 'Usuarios', value: 'users' },
        { label: 'Roles', value: 'roles' },
        { label: 'Permisos', value: 'permissions' },
        { label: 'Dispositivos', value: 'devices' },
        { label: 'Sensores', value: 'sensors' },
        { label: 'Lecturas', value: 'readings' },
        { label: 'MQTT', value: 'mqtt' },
        { label: 'EMQX', value: 'emqx' },
        { label: 'Administración', value: 'admin' },
        { label: 'Documentación API', value: 'api_docs' },
        { label: 'Otro', value: 'other' }
    ]

    const onAuditPageChange = (event: { page?: number; first?: number }) => {
        if (event.page !== undefined && event.first !== undefined) {
            setAuditPage(event.page + 1)
            setAuditFirst(event.first)
        }
    }

    const onAccessPageChange = (event: { page?: number; first?: number }) => {
        if (event.page !== undefined && event.first !== undefined) {
            setAccessPage(event.page + 1)
            setAccessFirst(event.first)
        }
    }

    // Templates para columnas de la tabla de auditoría
    const auditActionTemplate = (rowData: AuditLog) => {
        return (
            <span className={`${stylesPage.badge} ${getActionBadgeClass(rowData.action)}`}>
                {rowData.action}
            </span>
        )
    }

    const auditDateTemplate = (rowData: AuditLog) => {
        return <span>{formatDate(rowData.timestamp)}</span>
    }

    const auditActionsTemplate = (rowData: AuditLog) => {
        return (
            <Link 
                href={`/gestor_logs/audit/${rowData.id}`}
                className={stylesPage.btnActionIcon}
                title="Ver detalles"
            >
                <VisibilityIcon />
            </Link>
        )
    }

    const auditChangesTemplate = (rowData: AuditLog) => {
        const changesCount = rowData.changes ? Object.keys(rowData.changes).length : 0
        return <span>{changesCount} cambio{changesCount !== 1 ? 's' : ''}</span>
    }

    // Templates para columnas de la tabla de acceso
    const accessMethodTemplate = (rowData: AccessLog) => {
        return (
            <span className={`${stylesPage.badge} ${getMethodBadgeClass(rowData.method)}`}>
                {rowData.method}
            </span>
        )
    }

    const accessStatusTemplate = (rowData: AccessLog) => {
        return (
            <span className={`${stylesPage.badge} ${getStatusBadgeClass(rowData.status_code)}`}>
                {rowData.status_code}
            </span>
        )
    }

    const accessDateTemplate = (rowData: AccessLog) => {
        return <span>{formatDate(rowData.timestamp)}</span>
    }

    const accessResponseTimeTemplate = (rowData: AccessLog) => {
        return <span>{rowData.response_time_ms.toFixed(1)} ms</span>
    }

    const accessActionsTemplate = (rowData: AccessLog) => {
        return (
            <Link 
                href={`/gestor_logs/access/${rowData.id}`}
                className={stylesPage.btnActionIcon}
                title="Ver detalles"
            >
                <VisibilityIcon />
            </Link>
        )
    }

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.titleSection}>
                        <div className={stylesPage.titleWrapper}>
                            <AssessmentIcon className={stylesPage.titleIcon} />
                            <h1 className={stylesPage.pageTitle}>Auditoría y Logs</h1>
                        </div>
                        <p className={stylesPage.pageSubtitle}>
                            Monitorea y analiza la actividad del sistema
                        </p>
                    </div>
                </div>

                {/* Estadísticas */}
                {(auditStats || accessStats) && (
                    <div className={stylesPage.statsContainer}>
                        <div className={stylesPage.statsGrid}>
                            <div className={stylesPage.statCard}>
                                <div className={`${stylesPage.statIcon} ${stylesPage.statIconAudit}`}>
                                    <AssessmentIcon style={{ fontSize: '2rem' }} />
                                </div>
                                <div className={stylesPage.statContent}>
                                    <div className={stylesPage.statValue}>{auditStats?.total_logs || 0}</div>
                                    <div className={stylesPage.statLabel}>Logs de Auditoría</div>
                                </div>
                            </div>
                            <div className={stylesPage.statCard}>
                                <div className={`${stylesPage.statIcon} ${stylesPage.statIconAccess}`}>
                                    <ComputerIcon style={{ fontSize: '2rem' }} />
                                </div>
                                <div className={stylesPage.statContent}>
                                    <div className={stylesPage.statValue}>{accessStats?.total_requests || 0}</div>
                                    <div className={stylesPage.statLabel}>Logs de Acceso</div>
                                </div>
                            </div>
                            <div className={stylesPage.statCard}>
                                <div className={`${stylesPage.statIcon} ${stylesPage.statIconSpeed}`}>
                                    <SpeedIcon style={{ fontSize: '2rem' }} />
                                </div>
                                <div className={stylesPage.statContent}>
                                    <div className={stylesPage.statValue}>
                                        {accessStats?.avg_response_time_ms?.toFixed(1) || 0} ms
                                    </div>
                                    <div className={stylesPage.statLabel}>Tiempo Promedio</div>
                                </div>
                            </div>
                        </div>

                        {/* Gráficos de estadísticas */}
                        <div className={stylesPage.chartsContainer}>
                            <div className={stylesPage.chartCard}>
                                <h3 className={stylesPage.chartTitle}>Distribución de Acciones de Auditoría</h3>
                                <div className={stylesPage.chartWrapper}>
                                    <Doughnut data={auditActionsChartData} options={doughnutChartOptions} />
                                </div>
                            </div>
                            <div className={stylesPage.chartCard}>
                                <h3 className={stylesPage.chartTitle}>Actividad de Acceso por Método</h3>
                                <div className={stylesPage.chartWrapper}>
                                    <Line data={accessMethodsChartData} options={lineChartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    {/* Tab Audit Logs */}
                    <TabPanel header="Logs de Auditoría" leftIcon="pi pi-shield">
                        <div className={stylesPage.tabContent}>
                            {/* Filtros de Auditoría */}
                            <div className={stylesPage.filtersSection}>
                                <div className={stylesPage.searchContainer}>
                                    <div className={stylesPage.searchBox}>
                                        <SearchIcon className={stylesPage.searchIcon} />
                                        <InputText
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar por usuario..."
                                            className={stylesPage.searchInput}
                                        />
                                    </div>
                                </div>
                                
                                <div className={stylesPage.filterRow}>
                                    <div className={stylesPage.filterGroup}>
                                        <FilterListIcon className={stylesPage.filterIcon} />
                                        <Dropdown
                                            value={auditFilters.action}
                                            options={actionOptions}
                                            onChange={(e) => setAuditFilters({ ...auditFilters, action: e.value })}
                                            placeholder="Filtrar por acción"
                                            className={stylesPage.filterDropdown}
                                        />
                                        <InputText
                                            value={auditFilters.model_name}
                                            onChange={(e) => setAuditFilters({ ...auditFilters, model_name: e.target.value })}
                                            placeholder="Modelo (ej: Dispositivo)"
                                            className={stylesPage.filterInput}
                                        />
                                    </div>
                                    <button onClick={handleExportAuditLogs} className={stylesPage.btnExport}>
                                        <DownloadIcon />
                                        <span>Exportar CSV</span>
                                    </button>
                                </div>
                            </div>

                            {/* Contador */}
                            <div className={stylesPage.searchStats}>
                                {auditTotalCount} registro{auditTotalCount !== 1 ? 's' : ''} encontrado{auditTotalCount !== 1 ? 's' : ''}
                            </div>

                            {/* Tabla de Audit Logs */}
                            <DataTable 
                                value={auditLogs} 
                                paginator 
                                rows={rowsPerPage}
                                totalRecords={auditTotalCount}
                                lazy
                                first={auditFirst}
                                onPage={onAuditPageChange}
                                emptyMessage={
                                    <div className={stylesPage.emptyState}>
                                        <HistoryIcon style={{ fontSize: '4rem', color: 'var(--neutral-400)' }} />
                                        <h3>No hay logs de auditoría</h3>
                                        <p>No se encontraron registros con los filtros aplicados</p>
                                    </div>
                                }
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                                className="p-datatable-sm"
                            >
                                <Column field="id" header="ID" style={{ width: '80px' }} />
                                <Column field="action" header="Acción" body={auditActionTemplate} style={{ width: '120px' }} />
                                <Column field="model_name" header="Modelo" style={{ width: '150px' }} />
                                <Column field="object_repr" header="Objeto" />
                                <Column field="username" header="Usuario" style={{ width: '150px' }} />
                                <Column field="ip_address" header="IP" style={{ width: '150px' }} />
                                <Column header="Cambios" body={auditChangesTemplate} style={{ width: '120px' }} />
                                <Column field="timestamp" header="Fecha" body={auditDateTemplate} style={{ width: '180px' }} />
                                <Column header="Acciones" body={auditActionsTemplate} style={{ width: '100px', textAlign: 'center' }} />
                            </DataTable>
                        </div>
                    </TabPanel>

                    {/* Tab Access Logs */}
                    <TabPanel header="Logs de Acceso" leftIcon="pi pi-lock">
                        <div className={stylesPage.tabContent}>
                            {/* Filtros de Acceso */}
                            <div className={stylesPage.filtersSection}>
                                <div className={stylesPage.searchContainer}>
                                    <div className={stylesPage.searchBox}>
                                        <SearchIcon className={stylesPage.searchIcon} />
                                        <InputText
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar en logs de acceso..."
                                            className={stylesPage.searchInput}
                                        />
                                    </div>
                                </div>
                                
                                <div className={stylesPage.filterRow}>
                                    <div className={stylesPage.filterGroup}>
                                        <FilterListIcon className={stylesPage.filterIcon} />
                                        <Dropdown
                                            value={accessFilters.method}
                                            options={methodOptions}
                                            onChange={(e) => setAccessFilters({ ...accessFilters, method: e.value })}
                                            placeholder="Método HTTP"
                                            className={stylesPage.filterDropdown}
                                        />
                                        <Dropdown
                                            value={accessFilters.module}
                                            options={moduleOptions}
                                            onChange={(e) => setAccessFilters({ ...accessFilters, module: e.value })}
                                            placeholder="Módulo"
                                            className={stylesPage.filterDropdown}
                                        />
                                        <InputText
                                            value={accessFilters.status_code}
                                            onChange={(e) => setAccessFilters({ ...accessFilters, status_code: e.target.value })}
                                            placeholder="Status code"
                                            className={stylesPage.filterInput}
                                            keyfilter="int"
                                        />
                                    </div>
                                    <button onClick={handleExportAccessLogs} className={stylesPage.btnExport}>
                                        <DownloadIcon />
                                        <span>Exportar CSV</span>
                                    </button>
                                </div>
                            </div>

                            {/* Contador */}
                            <div className={stylesPage.searchStats}>
                                {accessTotalCount} registro{accessTotalCount !== 1 ? 's' : ''} encontrado{accessTotalCount !== 1 ? 's' : ''}
                            </div>

                            {/* Tabla de Access Logs */}
                            <DataTable 
                                value={accessLogs} 
                                paginator 
                                rows={rowsPerPage}
                                totalRecords={accessTotalCount}
                                lazy
                                first={accessFirst}
                                onPage={onAccessPageChange}
                                emptyMessage={
                                    <div className={stylesPage.emptyState}>
                                        <HistoryIcon style={{ fontSize: '4rem', color: 'var(--neutral-400)' }} />
                                        <h3>No hay logs de acceso</h3>
                                        <p>No se encontraron registros con los filtros aplicados</p>
                                    </div>
                                }
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                                className="p-datatable-sm"
                            >
                                <Column field="id" header="ID" style={{ width: '80px' }} />
                                <Column field="method" header="Método" body={accessMethodTemplate} style={{ width: '100px' }} />
                                <Column field="status_code" header="Status" body={accessStatusTemplate} style={{ width: '100px' }} />
                                <Column field="endpoint" header="Endpoint" />
                                <Column field="module" header="Módulo" style={{ width: '150px' }} />
                                <Column field="username" header="Usuario" style={{ width: '150px' }} />
                                <Column field="ip_address" header="IP" style={{ width: '150px' }} />
                                <Column field="response_time_ms" header="Tiempo" body={accessResponseTimeTemplate} style={{ width: '110px' }} />
                                <Column field="timestamp" header="Fecha" body={accessDateTemplate} style={{ width: '180px' }} />
                                <Column header="Acciones" body={accessActionsTemplate} style={{ width: '100px', textAlign: 'center' }} />
                            </DataTable>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}

export default ManageLogsPage
