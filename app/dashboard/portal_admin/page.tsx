'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import DevicesIcon from '@mui/icons-material/Devices'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { TabPanel, TabView } from 'primereact/tabview'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    dispositivosService, 
    usuariosService,
    type Dispositivo 
} from '@/app/services/api.service'
import { isSuperUser } from '@/app/utils/permissions'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './portalAdmin.module.css'

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

interface DispositivoExtendido extends Dispositivo {
    propietario_nombre?: string
    propietario_email?: string
    total_lecturas?: number
}

const PortalAdminPage: React.FC = () => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [dispositivos, setDispositivos] = useState<DispositivoExtendido[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [globalFilter, setGlobalFilter] = useState('')

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
            console.log('🔍 Iniciando carga de usuarios...')
            // Usar el servicio de usuarios con autenticación correcta
            const response = await usuariosService.getAll()
            
            console.log('📦 Respuesta del servicio de usuarios:', response)
            
            // El servicio ahora retorna una respuesta paginada
            const usuariosData: Usuario[] = response.results || []
            
            console.log('👥 Usuarios encontrados:', usuariosData.length)
            
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
                console.log('✅ Usuarios cargados exitosamente:', usuariosEnriquecidos.length)
                console.log('📊 Estado usuarios después de setUsuarios:', usuariosEnriquecidos)
            } else {
                setUsuarios([])
                console.log('⚠️ No se encontraron usuarios')
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
                // Enriquecer con información del propietario
                const dispositivosEnriquecidos = response.results.map(dispositivo => ({
                    ...dispositivo,
                    propietario_nombre: dispositivo.propietario?.username || 'Sin propietario',
                    propietario_email: dispositivo.propietario?.email || 'N/A'
                }))

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

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    {/* Header */}
                    <div className={styles.pageHeader}>
                        <div className={styles.titleSection}>
                            <div className={styles.titleWrapper}>
                                <AdminPanelSettingsIcon className={styles.titleIcon} />
                                <h1 className={styles.pageTitle}>Portal Administrador</h1>
                            </div>
                            <p className={styles.pageSubtitle}>
                                Gestión completa de usuarios y dispositivos del sistema
                            </p>
                        </div>
                    </div>

                    {/* Barra de búsqueda y acciones */}
                    <div className={styles.cardHeader}>
                        <div className={styles.searchContainer}>
                            <div className={styles.searchBox}>
                                <SearchIcon className={styles.searchIcon} />
                                <InputText
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Buscar por nombre, email o ubicación..."
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>
                        <Button
                            icon={<RefreshIcon />}
                            label="Actualizar"
                            onClick={cargarDatos}
                            severity="success"
                            disabled={loading}
                            className={styles.btnCreate}
                        />
                    </div>

                    {/* Tarjetas de resumen */}
                    <div className={styles.statsSection}>
                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <PersonIcon className={styles.statIcon} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{usuarios.length}</span>
                                    <span className={styles.statLabel}>Total Usuarios</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <PersonIcon className={styles.statIcon} style={{ color: '#4caf50' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {usuarios.filter(u => u.is_active).length}
                                    </span>
                                    <span className={styles.statLabel}>Usuarios Activos</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <DevicesIcon className={styles.statIcon} style={{ color: '#2196f3' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{dispositivos.length}</span>
                                    <span className={styles.statLabel}>Total Dispositivos</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <DevicesIcon className={styles.statIcon} style={{ color: '#ff9800' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {dispositivos.filter(d => d.estado === 'activo').length}
                                    </span>
                                    <span className={styles.statLabel}>Dispositivos Activos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs con tablas */}
                    <div className={styles.tabsContainer}>
                        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                            <TabPanel header="Usuarios" leftIcon="pi pi-users">
                                <div className={styles.tableSection}>
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
                                </div>
                            </TabPanel>

                            <TabPanel header="Dispositivos" leftIcon="pi pi-tablet">
                                <div className={styles.tableSection}>
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
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default PortalAdminPage
