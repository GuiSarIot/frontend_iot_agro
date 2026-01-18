'use client'

import { useState, useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import DevicesIcon from '@mui/icons-material/Devices'
import FilterListIcon from '@mui/icons-material/FilterList'
import MapIcon from '@mui/icons-material/Map'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import SensorsIcon from '@mui/icons-material/Sensors'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    dispositivosService, 
    lecturasService,
    type Lectura 
} from '@/app/services/api.service'
import {
    dispositivoToMapMarker,
    type DispositivoMapMarker,
    type DispositivoConCoordenadas
} from '@/app/services/dispositivos-map.types'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './portalUsuario.module.css'
import '@/styles/dashboard-executive.css'

// Importar componente de mapa dinámicamente
const DispositivosMap = dynamic(
    () => import('@/components/shared/maps/DispositivosMap'),
    { ssr: false }
)

interface DispositivoConLecturas extends DispositivoConCoordenadas {
    ultimaLectura?: Lectura
    totalLecturas: number
}

interface DispositivoConCoordenadasOpcionales {
    latitud?: number
    longitud?: number
}

const PortalUsuarioPage: React.FC = () => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo: _userInfo } = appState
    const router = useRouter()

    const [dispositivos, setDispositivos] = useState<DispositivoConLecturas[]>([])
    const [dispositivosFiltrados, setDispositivosFiltrados] = useState<DispositivoConLecturas[]>([])
    const [loading, setLoading] = useState(false)
    const [mostrarFiltros, setMostrarFiltros] = useState(true)
    const [vistaActual, setVistaActual] = useState<'tabla' | 'mapa'>('tabla')
    
    // Filtros
    const [filtroNombre, setFiltroNombre] = useState('')
    const [filtroTipo, setFiltroTipo] = useState<string | null>(null)
    const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
    const [filtroUbicacion, setFiltroUbicacion] = useState('')

    useAccessLogger({ 
        customModule: 'devices',
        action: 'view'
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Mi Portal - Dispositivos')
        cargarMisDispositivos()
        showLoader(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Aplicar filtros cuando cambian
    useEffect(() => {
        aplicarFiltros()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroNombre, filtroTipo, filtroEstado, filtroUbicacion, dispositivos])

    const cargarMisDispositivos = async () => {
        setLoading(true)
        try {
            // Obtener dispositivos asignados al usuario actual
            const response = await dispositivosService.getMyDevices()
            
            if (response.results) {
                // Para cada dispositivo, obtener su última lectura
                const dispositivosConLecturas = await Promise.all(
                    response.results.map(async (dispositivo) => {
                        try {
                            // Obtener última lectura del dispositivo
                            const lecturasResponse = await lecturasService.getAll({
                                dispositivo: dispositivo.id,
                                ordering: '-fecha',
                                page_size: 1
                            })

                            // Contar total de lecturas del dispositivo
                            const totalLecturasResponse = await lecturasService.getAll({
                                dispositivo: dispositivo.id,
                                page_size: 1
                            })

                            // Generar coordenadas aleatorias si no existen (para demostración)
                            const dispositivoConCoords = dispositivo as DispositivoConCoordenadas & DispositivoConCoordenadasOpcionales
                            const lat = dispositivoConCoords.latitud ?? (4.60971 + (Math.random() - 0.5) * 0.1)
                            const lng = dispositivoConCoords.longitud ?? (-74.08175 + (Math.random() - 0.5) * 0.1)

                            return {
                                ...dispositivo,
                                latitud: lat,
                                longitud: lng,
                                ultimaLectura: lecturasResponse.results?.[0],
                                totalLecturas: totalLecturasResponse.count || 0
                            } as DispositivoConLecturas
                        } catch (error) {
                            console.error(`Error al cargar lecturas del dispositivo ${dispositivo.id}:`, error)
                            return {
                                ...dispositivo,
                                totalLecturas: 0
                            } as DispositivoConLecturas
                        }
                    })
                )
                
                setDispositivos(dispositivosConLecturas)
                setDispositivosFiltrados(dispositivosConLecturas)
            }
        } catch (error) {
            console.error('Error al cargar dispositivos:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar tus dispositivos',
                icon: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const aplicarFiltros = () => {
        let resultado = [...dispositivos]

        if (filtroNombre) {
            resultado = resultado.filter(d => 
                d.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
            )
        }

        if (filtroTipo) {
            resultado = resultado.filter(d => 
                typeof d.tipo === 'string' ? d.tipo === filtroTipo : (d.tipo as { nombre: string }).nombre === filtroTipo
            )
        }

        if (filtroEstado) {
            resultado = resultado.filter(d => d.estado === filtroEstado)
        }

        if (filtroUbicacion) {
            resultado = resultado.filter(d => 
                d.ubicacion?.toLowerCase().includes(filtroUbicacion.toLowerCase())
            )
        }

        setDispositivosFiltrados(resultado)
    }

    const limpiarFiltros = () => {
        setFiltroNombre('')
        setFiltroTipo(null)
        setFiltroEstado(null)
        setFiltroUbicacion('')
    }

    // Opciones para dropdowns
    const tiposUnicos = Array.from(new Set(dispositivos.map(d => 
        typeof d.tipo === 'string' ? d.tipo : (d.tipo as { nombre?: string })?.nombre
    ).filter(Boolean)))
    const opcionesTipo = tiposUnicos.map(tipo => ({ label: tipo, value: tipo }))
    
    const opcionesEstado = [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' }
    ]

    // Templates para las columnas
    const nombreTemplate = (rowData: DispositivoConLecturas) => (
        <div className={styles.deviceName}>
            <DevicesIcon className={styles.deviceIcon} />
            <span>{rowData.nombre}</span>
        </div>
    )

    const estadoTemplate = (rowData: DispositivoConLecturas) => (
        <span className={rowData.estado === 'activo' ? styles.estadoActivo : styles.estadoInactivo}>
            {rowData.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
        </span>
    )

    const ultimaLecturaTemplate = (rowData: DispositivoConLecturas) => {
        if (!rowData.ultimaLectura) {
            return <span className={styles.sinDatos}>Sin lecturas</span>
        }

        const fecha = new Date(rowData.ultimaLectura.fecha_lectura || rowData.ultimaLectura.timestamp)
        return (
            <div className={styles.lecturaInfo}>
                <div className={styles.lecturaValor}>
                    <SensorsIcon fontSize="small" />
                    <strong>{rowData.ultimaLectura.valor}</strong>
                    <span className={styles.unidad}>{rowData.ultimaLectura.unidad || rowData.ultimaLectura.sensor_unidad}</span>
                </div>
                <div className={styles.lecturaFecha}>
                    {fecha.toLocaleDateString()} {fecha.toLocaleTimeString()}
                </div>
            </div>
        )
    }

    const totalLecturasTemplate = (rowData: DispositivoConLecturas) => (
        <div className={styles.totalLecturas}>
            <TrendingUpIcon fontSize="small" />
            <span>{rowData.totalLecturas}</span>
        </div>
    )

    const accionesTemplate = (rowData: DispositivoConLecturas) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={`/dashboard/portal_usuario/dispositivo/${rowData.id}`}>
                <Button
                    icon={<VisibilityIcon style={{ fontSize: '1rem' }} />}
                    label="Ver Lecturas"
                    rounded
                    text
                    severity="info"
                    aria-label="Ver lecturas"
                    title="Ver lecturas"
                />
            </Link>
        </div>
    )

    // Preparar marcadores para el mapa
    const marcadoresDispositivos = useMemo<DispositivoMapMarker[]>(() => {
        return dispositivosFiltrados
            .map(dispositivo => {
                const ultimaLecturaForMap = dispositivo.ultimaLectura ? {
                    valor: String(dispositivo.ultimaLectura.valor),
                    unidad: dispositivo.ultimaLectura.unidad || dispositivo.ultimaLectura.sensor_unidad,
                    fecha: dispositivo.ultimaLectura.fecha_lectura || dispositivo.ultimaLectura.timestamp
                } : undefined
                return dispositivoToMapMarker(dispositivo, ultimaLecturaForMap)
            })
            .filter((marker): marker is DispositivoMapMarker => marker !== null)
    }, [dispositivosFiltrados])

    const handleDeviceClick = (dispositivoId: number) => {
        router.push(`/dashboard/portal_usuario/dispositivo/${dispositivoId}`)
    }

    // Calcular estadísticas
    const estadisticas = useMemo(() => {
        const total = dispositivos.length
        const activos = dispositivos.filter(d => d.estado === 'activo').length
        const totalLecturas = dispositivos.reduce((acc, d) => acc + d.totalLecturas, 0)
        const promedioLecturas = total > 0 ? Math.round(totalLecturas / total) : 0

        return {
            total,
            activos,
            inactivos: total - activos,
            totalLecturas,
            promedioLecturas,
            tasaActivacion: total > 0 ? Math.round((activos / total) * 100) : 0
        }
    }, [dispositivos])

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <div className={styles.titleSection}>
                            <div className={styles.titleWrapper}>
                                <DevicesIcon className={styles.titleIcon} />
                                <h1 className={styles.pageTitle}>Mi Portal IoT</h1>
                            </div>
                            <p className={styles.pageSubtitle}>Monitoreo y gestión de tus dispositivos conectados</p>
                        </div>
                    </div>

                    {/* Card Header - Búsqueda y acciones */}
                    <div className={styles.cardHeader}>
                        <div className={styles.searchContainer}>
                            <div className={styles.searchBox}>
                                <SearchIcon className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    value={filtroNombre}
                                    onChange={(e) => setFiltroNombre(e.target.value)}
                                    placeholder="Buscar dispositivo..."
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => setMostrarFiltros(!mostrarFiltros)} 
                            className={styles.btnFilter}
                            title="Filtros"
                        >
                            <FilterListIcon />
                            <span>{mostrarFiltros ? 'Ocultar' : 'Filtros'}</span>
                        </button>
                        <button 
                            onClick={cargarMisDispositivos} 
                            className={styles.btnRefresh}
                            disabled={loading}
                            title="Actualizar datos"
                        >
                            <RefreshIcon />
                            <span>Actualizar</span>
                        </button>
                    </div>

                    {/* Estadísticas */}
                    <div className={styles.statsSection}>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📡</span>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Mis Dispositivos</div>
                                <div className={styles.statValue}>{estadisticas.total}</div>
                                <div className={styles.statTrend}>
                                    Total asignados
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>🟢</span>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Dispositivos Activos</div>
                                <div className={styles.statValue}>{estadisticas.activos}</div>
                                <div className={styles.statTrendPositive}>
                                    {estadisticas.tasaActivacion}% operativos
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📊</span>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Total Lecturas</div>
                                <div className={styles.statValue}>{estadisticas.totalLecturas.toLocaleString()}</div>
                                <div className={styles.statTrend}>
                                    Datos registrados
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📈</span>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Promedio Lecturas</div>
                                <div className={styles.statValue}>{estadisticas.promedioLecturas}</div>
                                <div className={styles.statTrend}>
                                    Por dispositivo
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Datos */}
                    <div className={styles.dataSection}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitle}>
                                <MapIcon className={styles.sectionIcon} />
                                <span>Localización de Dispositivos</span>
                            </div>
                            <div className={styles.viewControls}>
                                <button 
                                    className={`${styles.viewButton} ${vistaActual === 'mapa' ? styles.active : ''}`}
                                    onClick={() => setVistaActual('mapa')}
                                >
                                    <MapIcon />
                                    Vista Mapa
                                </button>
                                <button 
                                    className={`${styles.viewButton} ${vistaActual === 'tabla' ? styles.active : ''}`}
                                    onClick={() => setVistaActual('tabla')}
                                >
                                    <DevicesIcon />
                                    Vista Tabla
                                </button>
                            </div>
                        </div>

                        {vistaActual === 'mapa' ? (
                            <div className={styles.mapContainer}>
                                <DispositivosMap 
                                    dispositivos={marcadoresDispositivos}
                                    height="600px"
                                    centerOnDevices={true}
                                    onDeviceClick={handleDeviceClick}
                                />
                                <div className={styles.legend}>
                                    <div className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.active}`}></span>
                                        <span>Dispositivo Activo ({estadisticas.activos})</span>
                                    </div>
                                    <div className={styles.legendItem}>
                                        <span className={`${styles.legendDot} ${styles.inactive}`}></span>
                                        <span>Dispositivo Inactivo ({estadisticas.inactivos})</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.tablesContainer}>
                                {/* Sección de filtros */}
                                {mostrarFiltros && (
                                    <div className={styles.filtrosContainer}>
                                        <div className={styles.filtrosGrid}>
                                            <div className={styles.filtroItem}>
                                                <label className={styles.filtroLabel}>Nombre</label>
                                                <InputText
                                                    value={filtroNombre}
                                                    onChange={(e) => setFiltroNombre(e.target.value)}
                                                    placeholder="Buscar por nombre..."
                                                />
                                            </div>

                                            <div className={styles.filtroItem}>
                                                <label className={styles.filtroLabel}>Tipo</label>
                                                <Dropdown
                                                    value={filtroTipo}
                                                    onChange={(e) => setFiltroTipo(e.value)}
                                                    options={opcionesTipo}
                                                    placeholder="Todos"
                                                    showClear
                                                    filter
                                                />
                                            </div>

                                            <div className={styles.filtroItem}>
                                                <label className={styles.filtroLabel}>Estado</label>
                                                <Dropdown
                                                    value={filtroEstado}
                                                    onChange={(e) => setFiltroEstado(e.value)}
                                                    options={opcionesEstado}
                                                    placeholder="Todos"
                                                    showClear
                                                />
                                            </div>

                                            <div className={styles.filtroItem}>
                                                <label className={styles.filtroLabel}>Ubicación</label>
                                                <InputText
                                                    value={filtroUbicacion}
                                                    onChange={(e) => setFiltroUbicacion(e.target.value)}
                                                    placeholder="Buscar por ubicación..."
                                                />
                                            </div>

                                            <div className={styles.filtroItem}>
                                                <Button
                                                    label="Limpiar filtros"
                                                    onClick={limpiarFiltros}
                                                    severity="secondary"
                                                    outlined
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tabla de dispositivos */}
                                <DataTable
                                    value={dispositivosFiltrados}
                                    loading={loading}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    emptyMessage="No se encontraron dispositivos"
                                    stripedRows
                                    showGridlines
                                >
                                    <Column 
                                        field="id" 
                                        header="ID" 
                                        sortable
                                        style={{ width: '80px' }}
                                    />
                                    <Column 
                                        field="nombre" 
                                        header="DISPOSITIVO" 
                                        body={nombreTemplate}
                                        sortable
                                    />
                                    <Column 
                                        field="tipo.nombre" 
                                        header="TIPO" 
                                        sortable
                                    />
                                    <Column 
                                        field="ubicacion" 
                                        header="UBICACIÓN" 
                                        sortable
                                    />
                                    <Column 
                                        field="estado" 
                                        header="ESTADO" 
                                        body={estadoTemplate}
                                        sortable
                                    />
                                    <Column 
                                        header="ÚLTIMA LECTURA" 
                                        body={ultimaLecturaTemplate}
                                    />
                                    <Column 
                                        header="TOTAL LECTURAS" 
                                        body={totalLecturasTemplate}
                                        sortable
                                    />
                                    <Column 
                                        header="ACCIONES" 
                                        body={accionesTemplate}
                                        style={{ width: '180px' }}
                                    />
                                </DataTable>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default PortalUsuarioPage
