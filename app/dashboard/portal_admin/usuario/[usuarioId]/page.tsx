'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DevicesIcon from '@mui/icons-material/Devices'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import SensorsIcon from '@mui/icons-material/Sensors'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    dispositivosService, 
    lecturasService,
    type Dispositivo,
    type Lectura 
} from '@/app/services/api.service'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './detalleUsuario.module.css'

interface Usuario {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    phone?: string
    fecha_registro?: string
}

interface DispositivoConLecturas extends Dispositivo {
    ultimaLectura?: Lectura
    totalLecturas: number
}

interface DetalleUsuarioProps {
    params: {
        usuarioId: string
    }
}

const DetalleUsuarioPage = ({ params }: DetalleUsuarioProps) => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo } = appState
    const router = useRouter()
    const usuarioId = params.usuarioId

    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [dispositivos, setDispositivos] = useState<DispositivoConLecturas[]>([])
    const [loading, setLoading] = useState(false)

    useAccessLogger({ 
        customModule: 'other',
        action: 'view'
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Detalle de Usuario')

        // Verificar permisos
        if (!userInfo.hasRolSistema) {
            Swal.fire({
                title: 'Acceso Denegado',
                text: 'No tienes permisos para acceder a este módulo',
                icon: 'error'
            }).then(() => {
                router.push('/dashboard')
            })
            return
        }

        cargarDatos()
        showLoader(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuarioId])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            await Promise.all([
                cargarUsuario(),
                cargarDispositivos()
            ])
        } finally {
            setLoading(false)
        }
    }

    const cargarUsuario = async () => {
        try {
            const { data, status } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${usuarioId}/`
            })

            if (status === 'success' && data) {
                setUsuario(data)
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información del usuario',
                icon: 'error'
            })
        }
    }

    const cargarDispositivos = async () => {
        try {
            const response = await dispositivosService.getAll({ 
                propietario: Number(usuarioId)
            })
            
            if (response.results) {
                // Para cada dispositivo, obtener su última lectura
                const dispositivosConLecturas = await Promise.all(
                    response.results.map(async (dispositivo) => {
                        try {
                            // Obtener última lectura del dispositivo
                            const lecturasResponse = await lecturasService.getAll({
                                dispositivo: dispositivo.id,
                                ordering: '-fecha_lectura',
                                page_size: 1
                            })

                            // Contar total de lecturas
                            const totalLecturasResponse = await lecturasService.getAll({
                                dispositivo: dispositivo.id,
                                page_size: 1
                            })

                            return {
                                ...dispositivo,
                                ultimaLectura: lecturasResponse.results?.[0],
                                totalLecturas: totalLecturasResponse.count || 0
                            }
                        } catch (error) {
                            console.error(`Error al cargar lecturas del dispositivo ${dispositivo.id}:`, error)
                            return {
                                ...dispositivo,
                                totalLecturas: 0
                            }
                        }
                    })
                )
                
                setDispositivos(dispositivosConLecturas)
            }
        } catch (error) {
            console.error('Error al cargar dispositivos:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los dispositivos del usuario',
                icon: 'error'
            })
        }
    }

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

        const fecha = new Date(rowData.ultimaLectura.fecha_lectura)
        return (
            <div className={styles.lecturaInfo}>
                <div className={styles.lecturaValor}>
                    <SensorsIcon fontSize="small" />
                    <strong>{rowData.ultimaLectura.valor}</strong>
                    <span className={styles.unidad}>{rowData.ultimaLectura.unidad}</span>
                </div>
                <div className={styles.lecturaFecha}>
                    {fecha.toLocaleDateString()} {fecha.toLocaleTimeString()}
                </div>
            </div>
        )
    }

    const totalLecturasTemplate = (rowData: DispositivoConLecturas) => (
        <div className={styles.totalLecturas}>
            <SensorsIcon fontSize="small" />
            <span>{rowData.totalLecturas}</span>
        </div>
    )

    const accionesTemplate = (rowData: DispositivoConLecturas) => (
        <div className={styles.actions}>
            <Link href={`/gestor_dispositivos/${rowData.id}`}>
                <button className={styles.btnGestionar} title="Gestionar dispositivo">
                    <VisibilityIcon /> Gestionar
                </button>
            </Link>
        </div>
    )

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button 
                        onClick={() => router.push('/dashboard/portal_admin')} 
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

                {usuario && (
                    <>
                        {/* Tarjeta de información del usuario */}
                        <div className={styles.userCard}>
                            <div className={styles.userHeader}>
                                <PersonIcon className={styles.userIcon} />
                                <div className={styles.userInfo}>
                                    <h1>{usuario.first_name} {usuario.last_name}</h1>
                                    <p className={styles.username}>@{usuario.username}</p>
                                </div>
                            </div>
                            <div className={styles.userDetails}>
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Email:</span>
                                    <span className={styles.value}>{usuario.email}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.label}>Estado:</span>
                                    <span className={usuario.is_active ? styles.estadoActivo : styles.estadoInactivo}>
                                        {usuario.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                                    </span>
                                </div>
                                {usuario.phone && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.label}>Teléfono:</span>
                                        <span className={styles.value}>{usuario.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tarjetas de estadísticas */}
                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <DevicesIcon className={styles.statIcon} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{dispositivos.length}</span>
                                    <span className={styles.statLabel}>Total Dispositivos</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <DevicesIcon className={styles.statIcon} style={{ color: '#4caf50' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {dispositivos.filter(d => d.estado === 'activo').length}
                                    </span>
                                    <span className={styles.statLabel}>Dispositivos Activos</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <SensorsIcon className={styles.statIcon} style={{ color: '#2196f3' }} />
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>
                                        {dispositivos.reduce((sum, d) => sum + d.totalLecturas, 0)}
                                    </span>
                                    <span className={styles.statLabel}>Total Lecturas</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de dispositivos */}
                        <div className={styles.tableContainer}>
                            <h2>
                                <DevicesIcon /> Dispositivos del Usuario
                            </h2>
                            <DataTable
                                value={dispositivos}
                                loading={loading}
                                paginator
                                rows={10}
                                emptyMessage="Este usuario no tiene dispositivos registrados"
                                className={styles.dataTable}
                            >
                                <Column 
                                    field="nombre" 
                                    header="Dispositivo" 
                                    body={nombreTemplate}
                                    sortable
                                />
                                <Column 
                                    field="tipo.nombre" 
                                    header="Tipo" 
                                    sortable
                                />
                                <Column 
                                    field="ubicacion" 
                                    header="Ubicación" 
                                    sortable
                                />
                                <Column 
                                    field="estado" 
                                    header="Estado" 
                                    body={estadoTemplate}
                                    sortable
                                />
                                <Column 
                                    header="Última Lectura" 
                                    body={ultimaLecturaTemplate}
                                />
                                <Column 
                                    header="Total Lecturas" 
                                    body={totalLecturasTemplate}
                                    sortable
                                />
                                <Column 
                                    header="Acciones" 
                                    body={accionesTemplate}
                                    style={{ width: '180px' }}
                                />
                            </DataTable>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    )
}

export default DetalleUsuarioPage
