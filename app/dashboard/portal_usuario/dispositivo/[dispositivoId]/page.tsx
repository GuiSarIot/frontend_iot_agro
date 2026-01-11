'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DevicesIcon from '@mui/icons-material/Devices'
import RefreshIcon from '@mui/icons-material/Refresh'
import SensorsIcon from '@mui/icons-material/Sensors'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Calendar } from 'primereact/calendar'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    dispositivosService, 
    lecturasService,
    type Dispositivo, 
    type Lectura 
} from '@/app/services/api.service'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './detalleDispositivo.module.css'

interface DetalleDispositivoProps {
    params: {
        dispositivoId: string
    }
}

const DetalleDispositivoPage = ({ params }: DetalleDispositivoProps) => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const router = useRouter()
    const dispositivoId = params.dispositivoId

    const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null)
    const [lecturas, setLecturas] = useState<Lectura[]>([])
    const [loading, setLoading] = useState(false)
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
    const [fechaFin, setFechaFin] = useState<Date | null>(null)

    useAccessLogger({ 
        customModule: 'devices',
        action: 'view'
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Detalle de Dispositivo')
        cargarDatos()
        showLoader(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispositivoId])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            // Cargar dispositivo
            const dispositivoData = await dispositivosService.getById(Number(dispositivoId))
            
            // Verificar que el usuario sea propietario del dispositivo
            if (dispositivoData.propietario?.id !== userInfo.id) {
                Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'No tienes permiso para ver este dispositivo',
                    icon: 'error'
                }).then(() => {
                    router.push('/dashboard/portal_usuario')
                })
                return
            }

            setDispositivo(dispositivoData)

            // Cargar lecturas
            await cargarLecturas()
        } catch (error) {
            console.error('Error al cargar datos:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información del dispositivo',
                icon: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const cargarLecturas = async () => {
        try {
            const params: any = {
                dispositivo: Number(dispositivoId),
                ordering: '-fecha_lectura',
                page_size: 50
            }

            if (fechaInicio) {
                params.fecha_inicio = fechaInicio.toISOString()
            }
            if (fechaFin) {
                params.fecha_fin = fechaFin.toISOString()
            }

            const response = await lecturasService.getAll(params)
            setLecturas(response.results || [])
        } catch (error) {
            console.error('Error al cargar lecturas:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las lecturas',
                icon: 'error'
            })
        }
    }

    const aplicarFiltros = () => {
        cargarLecturas()
    }

    const limpiarFiltros = () => {
        setFechaInicio(null)
        setFechaFin(null)
        setTimeout(() => cargarLecturas(), 100)
    }

    // Templates para las columnas
    const fechaTemplate = (rowData: Lectura) => {
        const fecha = new Date(rowData.fecha_lectura)
        return (
            <div className={styles.fechaInfo}>
                <div className={styles.fecha}>{fecha.toLocaleDateString()}</div>
                <div className={styles.hora}>{fecha.toLocaleTimeString()}</div>
            </div>
        )
    }

    const valorTemplate = (rowData: Lectura) => (
        <div className={styles.valorInfo}>
            <SensorsIcon fontSize="small" className={styles.sensorIcon} />
            <strong>{rowData.valor}</strong>
            <span className={styles.unidad}>{rowData.unidad}</span>
        </div>
    )

    const sensorTemplate = (rowData: Lectura) => (
        <div className={styles.sensorInfo}>
            {rowData.sensor?.nombre || 'N/A'}
        </div>
    )

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button 
                        onClick={() => router.push('/dashboard/portal_usuario')} 
                        className={styles.btnBack}
                    >
                        <ArrowBackIcon /> Volver
                    </button>
                    <button 
                        onClick={cargarDatos} 
                        className={styles.btnRefresh}
                        disabled={loading}
                    >
                        <RefreshIcon /> Actualizar
                    </button>
                </div>

                {dispositivo && (
                    <>
                        {/* Información del dispositivo */}
                        <div className={styles.deviceCard}>
                            <div className={styles.deviceHeader}>
                                <DevicesIcon className={styles.deviceIcon} />
                                <div className={styles.deviceInfo}>
                                    <h1>{dispositivo.nombre}</h1>
                                    <p className={styles.deviceType}>{dispositivo.tipo?.nombre || 'N/A'}</p>
                                </div>
                            </div>
                            <div className={styles.deviceDetails}>
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Ubicación:</span>
                                    <span className={styles.value}>{dispositivo.ubicacion || 'N/A'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Estado:</span>
                                    <span className={dispositivo.estado === 'activo' ? styles.estadoActivo : styles.estadoInactivo}>
                                        {dispositivo.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Descripción:</span>
                                    <span className={styles.value}>{dispositivo.descripcion || 'Sin descripción'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <TrendingUpIcon className={styles.statIcon} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{lecturas.length}</span>
                                    <span className={styles.statLabel}>Lecturas Mostradas</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <SensorsIcon className={styles.statIcon} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {lecturas.length > 0 ? lecturas[0].valor : 'N/A'}
                                    </span>
                                    <span className={styles.statLabel}>Última Lectura</span>
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className={styles.filtersCard}>
                            <h3>Filtros de Búsqueda</h3>
                            <div className={styles.filters}>
                                <div className={styles.filterItem}>
                                    <label>Fecha Inicio:</label>
                                    <Calendar 
                                        value={fechaInicio} 
                                        onChange={(e) => setFechaInicio(e.value as Date)}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        placeholder="Seleccionar fecha"
                                    />
                                </div>
                                <div className={styles.filterItem}>
                                    <label>Fecha Fin:</label>
                                    <Calendar 
                                        value={fechaFin} 
                                        onChange={(e) => setFechaFin(e.value as Date)}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        placeholder="Seleccionar fecha"
                                    />
                                </div>
                                <div className={styles.filterActions}>
                                    <button onClick={aplicarFiltros} className={styles.btnFiltrar}>
                                        Aplicar Filtros
                                    </button>
                                    <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de lecturas */}
                        <div className={styles.tableContainer}>
                            <h2>
                                <SensorsIcon /> Historial de Lecturas
                            </h2>
                            <DataTable
                                value={lecturas}
                                loading={loading}
                                paginator
                                rows={20}
                                emptyMessage="No hay lecturas registradas"
                                className={styles.dataTable}
                            >
                                <Column 
                                    header="Fecha y Hora" 
                                    body={fechaTemplate}
                                    sortable
                                />
                                <Column 
                                    header="Sensor" 
                                    body={sensorTemplate}
                                    sortable
                                />
                                <Column 
                                    header="Valor" 
                                    body={valorTemplate}
                                    sortable
                                />
                                <Column 
                                    field="observaciones" 
                                    header="Observaciones" 
                                />
                            </DataTable>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    )
}

export default DetalleDispositivoPage
