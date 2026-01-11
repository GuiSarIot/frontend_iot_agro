'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import DevicesIcon from '@mui/icons-material/Devices'
import FilterListIcon from '@mui/icons-material/FilterList'
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
    type Dispositivo, 
    type Lectura 
} from '@/app/services/api.service'
import AppLayout from '@/components/shared/layout/AppLayout'
import { useAppContext } from '@/context/appContext'

import styles from './portalUsuario.module.css'

interface DispositivoConLecturas extends Dispositivo {
    ultimaLectura?: Lectura
    totalLecturas: number
}

const PortalUsuarioPage: React.FC = () => {
    const { changeTitle, showNavbar, appState, showLoader } = useAppContext()
    const { userInfo: _userInfo } = appState

    const [dispositivos, setDispositivos] = useState<DispositivoConLecturas[]>([])
    const [dispositivosFiltrados, setDispositivosFiltrados] = useState<DispositivoConLecturas[]>([])
    const [loading, setLoading] = useState(false)
    const [mostrarFiltros, setMostrarFiltros] = useState(true)
    
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

    return (
        <AppLayout showMainMenu={true}>
            <div className={styles.containerPage}>
                <div className={styles.mainCard}>
                    {/* Encabezado */}
                    <div className={styles.pageHeader}>
                        <div className={styles.headerContent}>
                            <div className={styles.titleSection}>
                                <div className={styles.titleWrapper}>
                                    <DevicesIcon className={styles.titleIcon} />
                                    <div>
                                        <h1 className={styles.pageTitle}>Mis Dispositivos</h1>
                                        <p className={styles.pageSubtitle}>
                                            Gestiona y monitorea tus dispositivos IoT
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.headerActions}>
                                <Button
                                    icon={<FilterListIcon />}
                                    label={mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
                                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                                    severity="secondary"
                                    outlined
                                />
                                
                                <Button
                                    icon={<RefreshIcon />}
                                    label="Actualizar"
                                    onClick={cargarMisDispositivos}
                                    severity="success"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                {/* Sección de filtros colapsable */}
                {mostrarFiltros && (
                    <div className={styles.filtrosSection}>
                        <div className={styles.filtrosGrid}>
                            <div className={styles.filtroItem}>
                                <label className={styles.filtroLabel}>NOMBRE</label>
                                <InputText
                                    value={filtroNombre}
                                    onChange={(e) => setFiltroNombre(e.target.value)}
                                    placeholder="Buscar por nombre..."
                                />
                            </div>

                            <div className={styles.filtroItem}>
                                <label className={styles.filtroLabel}>TIPO</label>
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
                                <label className={styles.filtroLabel}>ESTADO</label>
                                <Dropdown
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.value)}
                                    options={opcionesEstado}
                                    placeholder="Todos"
                                    showClear
                                />
                            </div>

                            <div className={styles.filtroItem}>
                                <label className={styles.filtroLabel}>UBICACIÓN</label>
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
                <div className={styles.tableSection}>
                    <div className={styles.tableContainer}>
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
                </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default PortalUsuarioPage
