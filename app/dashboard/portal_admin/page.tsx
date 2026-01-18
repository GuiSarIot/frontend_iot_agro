'use client'

import { useState, useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import DevicesIcon from '@mui/icons-material/Devices'
import EditIcon from '@mui/icons-material/Edit'
import MapIcon from '@mui/icons-material/Map'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { TabPanel, TabView } from 'primereact/tabview'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    dispositivosService, 
    lecturasService,
    usuariosService
} from '@/app/services/api.service'
import { 
    dispositivoToMapMarker,
    type DispositivoMapMarker,
    type DispositivoConCoordenadas 
} from '@/app/services/dispositivos-map.types'
import { isSuperUser } from '@/app/utils/permissions'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './portalAdmin.module.css'
import '@/styles/dashboard-executive.css'

// Importar componente de mapa dinámicamente para evitar problemas de SSR
const DispositivosMap = dynamic(
    () => import('@/components/shared/maps/DispositivosMap'),
    { ssr: false }
)

interface Usuario {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    fecha_registro?: string
    dispositivos_count?: number
    lecturas_count?: number
}

interface DispositivoExtendido extends DispositivoConCoordenadas {
    propietario_nombre?: string
    propietario_email?: string
    total_lecturas?: number
    ultimaLectura?: {
        valor: string | number
        unidad?: string
        fecha: string
    }
}

const PortalAdminPage: React.FC = () => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const router = useRouter()

    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [dispositivos, setDispositivos] = useState<DispositivoExtendido[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [globalFilter, setGlobalFilter] = useState('')
    const [vistaActual, setVistaActual] = useState<'tabla' | 'mapa'>('tabla')

    useAccessLogger({ 
        customModule: 'other',
        action: 'view'
    })

    useEffect(() => {
        const inicializar = async () => {
            showLoader(true)
            showNavbar(window.innerWidth > 1380)
            changeTitle('Portal Administrador')
            
            // Verificar que sea superusuario
            const isUserSuperUser = userInfo ? isSuperUser(userInfo) : false
            
            if (!isUserSuperUser) {
                Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'Solo los superusuarios pueden acceder a este módulo',
                    icon: 'error'
                }).then(() => {
                    window.location.href = '/dashboard'
                })
                showLoader(false)
                return
            }

            await cargarDatos()
            showLoader(false)
        }
        
        inicializar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const cargarDatos = async () => {
        setLoading(true)
        await Promise.all([
            cargarUsuarios(),
            cargarDispositivos()
        ])
        setLoading(false)
    }

    const cargarUsuarios = async () => {
        try {
            
            // Usar el servicio de usuarios con autenticación correcta
            const response = await usuariosService.getAll()
                        
            // El servicio ahora retorna una respuesta paginada
            const usuariosData: Usuario[] = response.results || []           
            
            if (usuariosData.length > 0) {
                // Enriquecer datos de usuarios con conteo de dispositivos
                const usuariosEnriquecidos = await Promise.all(
                    usuariosData.map(async (usuario) => {
                        try {
                            const dispositivosResponse = await dispositivosService.getAll({
                                propietario: usuario.id,
                                page_size: 1
                            })
                            
                            return {
                                ...usuario,
                                dispositivos_count: dispositivosResponse.count || 0
                            }
                        } catch (error) {
                            console.error(`Error al contar dispositivos de usuario ${usuario.id}:`, error)
                            return {
                                ...usuario,
                                dispositivos_count: 0
                            }
                        }
                    })
                )

                setUsuarios(usuariosEnriquecidos)
            } else {
                setUsuarios([])
            }
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error)
            Swal.fire({
                title: 'Error',
                text: `No se pudieron cargar los usuarios: ${error}`,
                icon: 'error'
            })
            setUsuarios([])
        }
    }

    const cargarDispositivos = async () => {
        try {
            // Obtener todos los dispositivos
            const response = await dispositivosService.getAll({ 
                page_size: 100 
            })

            if (response.results) {
                // Enriquecer con información del propietario y última lectura
                const dispositivosEnriquecidos = await Promise.all(
                    response.results.map(async (dispositivo) => {
                        try {
                            // Obtener última lectura
                            const lecturasResponse = await lecturasService.getAll({
                                dispositivo: dispositivo.id,
                                ordering: '-fecha',
                                page_size: 1
                            })

                            const ultimaLectura = lecturasResponse.results?.[0]

                            // Generar coordenadas aleatorias si no existen (para demostración)
                            const dispositivoConCoords = dispositivo as unknown as { latitud?: number; longitud?: number }
                            const lat = dispositivoConCoords.latitud ?? (4.60971 + (Math.random() - 0.5) * 0.1)
                            const lng = dispositivoConCoords.longitud ?? (-74.08175 + (Math.random() - 0.5) * 0.1)

                            return {
                                ...dispositivo,
                                latitud: lat,
                                longitud: lng,
                                propietario_nombre: dispositivo.propietario?.username || 'Sin propietario',
                                propietario_email: dispositivo.propietario?.email || 'N/A',
                                ultimaLectura: ultimaLectura ? {
                                    valor: ultimaLectura.valor,
                                    unidad: ultimaLectura.unidad || ultimaLectura.sensor_unidad,
                                    fecha: ultimaLectura.fecha_lectura || ultimaLectura.timestamp
                                } : undefined
                            } as DispositivoExtendido
                        } catch (error) {
                            console.error(`Error al enriquecer dispositivo ${dispositivo.id}:`, error)
                            return {
                                ...dispositivo,
                                propietario_nombre: dispositivo.propietario?.username || 'Sin propietario',
                                propietario_email: dispositivo.propietario?.email || 'N/A'
                            } as DispositivoExtendido
                        }
                    })
                )

                setDispositivos(dispositivosEnriquecidos)
            }
        } catch (error) {
            console.error('Error al cargar dispositivos:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los dispositivos',
                icon: 'error'
            })
        }
    }

    // Templates para tabla de usuarios
    const usuarioNombreTemplate = (rowData: Usuario) => (
        <div className={styles.userInfo}>
            <PersonIcon className={styles.userIcon} />
            <div>
                <div className={styles.userName}>
                    {rowData.first_name} {rowData.last_name}
                </div>
                <div className={styles.userEmail}>{rowData.email}</div>
            </div>
        </div>
    )

    const usuarioEstadoTemplate = (rowData: Usuario) => (
        <span className={rowData.is_active ? styles.estadoActivo : styles.estadoInactivo}>
            {rowData.is_active ? '🟢 Activo' : '🔴 Inactivo'}
        </span>
    )

    const usuarioDispositivosTemplate = (rowData: Usuario) => (
        <div className={styles.dispositivosCount}>
            <AssignmentIndIcon fontSize="small" />
            <span>{rowData.dispositivos_count || 0}</span>
        </div>
    )

    const usuarioAccionesTemplate = (rowData: Usuario) => (
        <div className={styles.actions}>
            <Link
                href={`/gestor_usuarios/${rowData.id}`}
                className={styles.btnAction}
                title="Ver detalle"
            >
                <EditIcon />
            </Link>
        </div>
    )

    // Templates para tabla de dispositivos
    const dispositivoNombreTemplate = (rowData: DispositivoExtendido) => (
        <div className={styles.deviceInfo}>
            <DevicesIcon className={styles.deviceIcon} />
            <div>
                <div className={styles.deviceName}>{rowData.nombre}</div>
                <div className={styles.deviceType}>
                    {typeof rowData.tipo === 'object' ? rowData.tipo.nombre : rowData.tipo_display || 'N/A'}
                </div>
            </div>
        </div>
    )

    const propietarioTemplate = (rowData: DispositivoExtendido) => (
        <div className={styles.ownerInfo}>
            <PersonIcon fontSize="small" className={styles.ownerIcon} />
            <div>
                <div className={styles.ownerName}>{rowData.propietario_nombre}</div>
                <div className={styles.ownerEmail}>{rowData.propietario_email}</div>
            </div>
        </div>
    )

    const dispositivoEstadoTemplate = (rowData: DispositivoExtendido) => (
        <span className={rowData.estado === 'activo' ? styles.estadoActivo : styles.estadoInactivo}>
            {rowData.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
        </span>
    )

    const dispositivoAccionesTemplate = (rowData: DispositivoExtendido) => (
        <div className={styles.actions}>
            <Link
                href={`/gestor_dispositivos/${rowData.id}`}
                className={styles.btnAction}
                title="Gestionar"
            >
                <EditIcon />
            </Link>
        </div>
    )

    // Preparar marcadores para el mapa
    const marcadoresDispositivos = useMemo<DispositivoMapMarker[]>(() => {
        return dispositivos
            .map(dispositivo => {
                const ultimaLecturaForMap = dispositivo.ultimaLectura ? {
                    valor: String(dispositivo.ultimaLectura.valor),
                    unidad: dispositivo.ultimaLectura.unidad,
                    fecha: dispositivo.ultimaLectura.fecha
                } : undefined
                return dispositivoToMapMarker(dispositivo, ultimaLecturaForMap)
            })
            .filter((marker): marker is DispositivoMapMarker => marker !== null)
    }, [dispositivos])

    const handleDeviceClick = (dispositivoId: number) => {
        router.push(`/gestor_dispositivos/${dispositivoId}`)
    }

    // Cálculo de estadísticas
    const estadisticas = useMemo(() => {
        const totalDispositivos = dispositivos.length
        const dispositivosActivos = dispositivos.filter(d => d.estado === 'activo').length
        const totalUsuarios = usuarios.length
        const usuariosActivos = usuarios.filter(u => u.is_active).length
        const totalLecturas = dispositivos.reduce((acc, d) => acc + (d.total_lecturas || 0), 0)

        return {
            totalDispositivos,
            dispositivosActivos,
            totalUsuarios,
            usuariosActivos,
            totalLecturas,
            dispositivosInactivos: totalDispositivos - dispositivosActivos,
            tasaActivacion: totalDispositivos > 0 
                ? Math.round((dispositivosActivos / totalDispositivos) * 100) 
                : 0
        }
    }, [dispositivos, usuarios])

    return (
        <AppLayout showMainMenu={true}>
            <div className="dashboardExecutive">
                {/* Header Ejecutivo */}
                <div className="executiveHeader">
                    <div className="executiveTitle">
                        <AdminPanelSettingsIcon style={{ fontSize: '2.5rem', marginRight: '1rem' }} />
                        Portal Ejecutivo - Administrador
                    </div>
                    <div className="executiveSubtitle">
                        Panel de control gerencial para supervisión completa del sistema IoT
                    </div>
                </div>

                {/* Estadísticas Ejecutivas */}
                <div className="executiveStats">
                    <div className="statCard">
                        <span className="statIcon">👥</span>
                        <div className="statLabel">Total Usuarios</div>
                        <div className="statValue">{estadisticas.totalUsuarios}</div>
                        <div className="statTrend">
                            <TrendingUpIcon style={{ fontSize: '1rem', marginRight: '0.25rem' }} />
                            {estadisticas.usuariosActivos} activos
                        </div>
                    </div>

                    <div className="statCard">
                        <span className="statIcon">📡</span>
                        <div className="statLabel">Dispositivos IoT</div>
                        <div className="statValue">{estadisticas.totalDispositivos}</div>
                        <div className="statTrend">
                            <TrendingUpIcon style={{ fontSize: '1rem', marginRight: '0.25rem' }} />
                            {estadisticas.tasaActivacion}% operativos
                        </div>
                    </div>

                    <div className="statCard">
                        <span className="statIcon">🟢</span>
                        <div className="statLabel">Dispositivos Activos</div>
                        <div className="statValue">{estadisticas.dispositivosActivos}</div>
                        <div className="statTrend" style={{ color: '#10b981' }}>
                            En tiempo real
                        </div>
                    </div>

                    <div className="statCard">
                        <span className="statIcon">📊</span>
                        <div className="statLabel">Total Lecturas</div>
                        <div className="statValue">{estadisticas.totalLecturas.toLocaleString()}</div>
                        <div className="statTrend">
                            Datos procesados
                        </div>
                    </div>
                </div>

                {/* Mapa de Dispositivos */}
                <div className="mapSection">
                    <div className="mapHeader">
                        <div className="mapTitle">
                            <MapIcon />
                            Monitoreo Geográfico en Tiempo Real
                        </div>
                        <div className="mapControls">
                            <button 
                                className={`mapFilter ${vistaActual === 'mapa' ? 'active' : ''}`}
                                onClick={() => setVistaActual('mapa')}
                            >
                                <MapIcon />
                                Vista Mapa
                            </button>
                            <button 
                                className={`mapFilter ${vistaActual === 'tabla' ? 'active' : ''}`}
                                onClick={() => setVistaActual('tabla')}
                            >
                                <DevicesIcon />
                                Vista Tabla
                            </button>
                            <button 
                                className="actionButton"
                                onClick={cargarDatos}
                                disabled={loading}
                            >
                                <RefreshIcon />
                                Actualizar
                            </button>
                        </div>
                    </div>

                    {vistaActual === 'mapa' ? (
                        <>
                            <DispositivosMap 
                                dispositivos={marcadoresDispositivos}
                                height="600px"
                                centerOnDevices={true}
                                onDeviceClick={handleDeviceClick}
                            />
                            <div className="legend">
                                <div className="legendItem">
                                    <span className="legendDot active"></span>
                                    <span>Dispositivo Activo ({estadisticas.dispositivosActivos})</span>
                                </div>
                                <div className="legendItem">
                                    <span className="legendDot inactive"></span>
                                    <span>Dispositivo Inactivo ({estadisticas.dispositivosInactivos})</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="executiveCard">
                            <div className="cardHeader">
                                <div className="searchContainer">
                                    <SearchIcon />
                                    <input
                                        type="text"
                                        className="executiveSearchInput"
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Buscar por nombre, email, ubicación..."
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                                <TabPanel header="Usuarios" leftIcon="pi pi-users">
                                    <DataTable
                                        value={usuarios}
                                        loading={loading}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                        emptyMessage="No hay usuarios registrados"
                                        stripedRows
                                        showGridlines
                                        globalFilter={globalFilter}
                                        globalFilterFields={['username', 'email', 'first_name', 'last_name']}
                                    >
                                        <Column 
                                            field="username" 
                                            header="USUARIO" 
                                            body={usuarioNombreTemplate}
                                            sortable
                                        />
                                        <Column 
                                            field="email" 
                                            header="EMAIL" 
                                            sortable
                                        />
                                        <Column 
                                            field="is_active" 
                                            header="ESTADO" 
                                            body={usuarioEstadoTemplate}
                                            sortable
                                        />
                                        <Column 
                                            header="DISPOSITIVOS" 
                                            body={usuarioDispositivosTemplate}
                                            sortable
                                        />
                                        <Column 
                                            header="ACCIONES" 
                                            body={usuarioAccionesTemplate}
                                            style={{ width: '180px' }}
                                        />
                                    </DataTable>
                                </TabPanel>

                                <TabPanel header="Dispositivos" leftIcon="pi pi-tablet">
                                    <DataTable
                                        value={dispositivos}
                                        loading={loading}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                        emptyMessage="No hay dispositivos registrados"
                                        stripedRows
                                        showGridlines
                                        globalFilter={globalFilter}
                                        globalFilterFields={['nombre', 'ubicacion', 'propietario_nombre', 'propietario_email']}
                                    >
                                        <Column 
                                            field="nombre" 
                                            header="DISPOSITIVO" 
                                            body={dispositivoNombreTemplate}
                                            sortable
                                        />
                                        <Column 
                                            header="PROPIETARIO" 
                                            body={propietarioTemplate}
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
                                            body={dispositivoEstadoTemplate}
                                            sortable
                                        />
                                        <Column 
                                            header="ACCIONES" 
                                            body={dispositivoAccionesTemplate}
                                            style={{ width: '180px' }}
                                        />
                                    </DataTable>
                                </TabPanel>
                            </TabView>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

export default PortalAdminPage
