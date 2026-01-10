'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import SensorsIcon from '@mui/icons-material/Sensors'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { 
    lecturasService, 
    dispositivosService,
    sensoresService,
    type Lectura,
    type LecturaQueryParams 
} from '@/app/services/api.service'
import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import { useAppContext } from '@/context/appContext'

import stylesPage from './mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageLecturasPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageLecturasPage: React.FC<ManageLecturasPageProps> = ({
    infoPage = {
        title: 'Lecturas',
        route: '/gestor_lecturas',
        role: 'Gestión de lecturas'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'readings',
        action: 'list'
    })

    // ---- Estados ----
    const [lecturas, setLecturas] = useState<Lectura[]>([])
    const [dispositivos, setDispositivos] = useState<Array<{ value: number; label: string }>>([])
    const [sensores, setSensores] = useState<Array<{ value: number; label: string }>>([])
    const [loading, setLoading] = useState(true)
    const [totalRecords, setTotalRecords] = useState(0)
    const [first, setFirst] = useState(0)
    const [rows, setRows] = useState(10)
    const [isInitialized, setIsInitialized] = useState(false)
    
    // Estados de filtros
    const [filters, setFilters] = useState<LecturaQueryParams>({
        page: 1,
        page_size: 10,
        ordering: '-timestamp'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
    const [fechaFin, setFechaFin] = useState<Date | null>(null)

    // ---- Funciones de carga ----
    const loadDispositivos = async () => {
        try {
            const response = await dispositivosService.getAll()
            const options = response.results.map(d => ({
                value: d.id,
                label: d.nombre
            }))
            setDispositivos(options)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }

    const loadSensores = async () => {
        try {
            const response = await sensoresService.getAll()
            const options = response.results.map(s => ({
                value: s.id,
                label: s.nombre
            }))
            setSensores(options)
        } catch (error) {
            console.error('Error cargando sensores:', error)
        }
    }

    const loadLecturas = useCallback(async () => {
        try {
            setLoading(true)
            showLoader(true)
            
            const response = await lecturasService.getAll(filters)
            setLecturas(response.results)
            setTotalRecords(response.count)
        } catch (error) {
            console.error('Error cargando lecturas:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las lecturas'
            })
        } finally {
            setLoading(false)
            showLoader(false)
        }
    }, [filters, showLoader])

    // ---- Efectos ----
    useEffect(() => {
        if (!isInitialized) {
            GetRoute()
            changeTitle(infoPage.title)
            showNavbar(true)
            changeUserInfo(userInfo)
            SaveRoute(infoPage)
            
            // Cargar datos iniciales
            loadDispositivos()
            loadSensores()
            setIsInitialized(true)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        loadLecturas()
    }, [loadLecturas])

    // ---- Handlers de filtros ----
    const handleFilterChange = (field: keyof LecturaQueryParams, value: unknown) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 1 // Resetear a la primera página al filtrar
        }))
        setFirst(0)
    }

    const handleFechaInicioChange = (date: Date | null) => {
        setFechaInicio(date)
        if (date) {
            handleFilterChange('fecha_inicio', date.toISOString())
        } else {
            const { fecha_inicio: _fecha_inicio, ...rest } = filters
            setFilters(rest)
        }
    }

    const handleFechaFinChange = (date: Date | null) => {
        setFechaFin(date)
        if (date) {
            handleFilterChange('fecha_fin', date.toISOString())
        } else {
            const { fecha_fin: _fecha_fin, ...rest } = filters
            setFilters(rest)
        }
    }

    const clearFilters = () => {
        setFilters({
            page: 1,
            page_size: 10,
            ordering: '-timestamp'
        })
        setFechaInicio(null)
        setFechaFin(null)
        setFirst(0)
    }

    // ---- Handlers de tabla ----
    const onPage = (event: { first: number; rows: number; page: number }) => {
        setFirst(event.first)
        setRows(event.rows)
        setFilters(prev => ({
            ...prev,
            page: event.page + 1,
            page_size: event.rows
        }))
    }

    // ---- Handlers de acciones ----
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar lectura?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                showLoader(true)
                await lecturasService.delete(id)
                
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La lectura ha sido eliminada correctamente',
                    timer: 2000
                })
                
                loadLecturas()
            } catch (error) {
                console.error('Error eliminando lectura:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la lectura'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    // ---- Templates de columnas ----
    const timestampTemplate = (rowData: Lectura) => {
        const date = new Date(rowData.timestamp)
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const valorTemplate = (rowData: Lectura) => {
        return `${rowData.valor} ${rowData.sensor_unidad}`
    }

    const actionsTemplate = (rowData: Lectura) => {
        const canDelete = userInfo?.is_superuser

        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={`/gestor_lecturas/${rowData.id}`}>
                    <Button
                        icon={<VisibilityIcon style={{ fontSize: '1rem' }} />}
                        rounded
                        text
                        severity="info"
                        aria-label="Ver detalles"
                        title="Ver detalles"
                    />
                </Link>
                
                {canDelete && (
                    <Button
                        icon={<DeleteIcon style={{ fontSize: '1rem' }} />}
                        rounded
                        text
                        severity="danger"
                        onClick={() => handleDelete(rowData.id)}
                        aria-label="Eliminar"
                        title="Eliminar"
                    />
                )}
            </div>
        )
    }

    // ---- Render ----
    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.headerContent}>
                        <div className={stylesPage.titleSection}>
                            <div className={stylesPage.titleWrapper}>
                                <SensorsIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Gestión de lecturas</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Administra las lecturas capturadas por los sensores del sistema
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className={stylesPage.headerActions}>
                            <Button
                                icon={<FilterListIcon />}
                                label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                                onClick={() => setShowFilters(!showFilters)}
                                severity="secondary"
                                outlined
                            />
                            
                            <Link href="/gestor_lecturas/crear">
                                <Button
                                    icon={<AddIcon />}
                                    label="Nueva lectura"
                                    severity="success"
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className={stylesPage.filtersSection}>
                        <div className={stylesPage.filtersGrid}>
                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Dispositivo</label>
                                <Dropdown
                                    value={filters.dispositivo}
                                    options={dispositivos}
                                    onChange={(e) => handleFilterChange('dispositivo', e.value)}
                                    placeholder="Todos los dispositivos"
                                    showClear
                                    filter
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Sensor</label>
                                <Dropdown
                                    value={filters.sensor}
                                    options={sensores}
                                    onChange={(e) => handleFilterChange('sensor', e.value)}
                                    placeholder="Todos los sensores"
                                    showClear
                                    filter
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Fecha inicio</label>
                                <Calendar
                                    value={fechaInicio}
                                    onChange={(e) => handleFechaInicioChange(e.value as Date)}
                                    showTime
                                    showIcon
                                    placeholder="Desde"
                                    dateFormat="dd/mm/yy"
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Fecha fin</label>
                                <Calendar
                                    value={fechaFin}
                                    onChange={(e) => handleFechaFinChange(e.value as Date)}
                                    showTime
                                    showIcon
                                    placeholder="Hasta"
                                    dateFormat="dd/mm/yy"
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <Button
                                    label="Limpiar filtros"
                                    onClick={clearFilters}
                                    severity="secondary"
                                    outlined
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de lecturas */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableContainer}>
                        <DataTable
                            value={lecturas}
                            loading={loading}
                            paginator
                            rows={rows}
                            first={first}
                            totalRecords={totalRecords}
                            onPage={onPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            lazy
                            emptyMessage="No se encontraron lecturas"
                            stripedRows
                            showGridlines
                        >
                            <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                            <Column 
                                field="timestamp" 
                                header="Fecha/Hora" 
                                body={timestampTemplate}
                                sortable
                                style={{ minWidth: '180px' }}
                            />
                            <Column 
                                field="dispositivo_nombre" 
                                header="Dispositivo" 
                                sortable
                                style={{ minWidth: '200px' }}
                            />
                            <Column 
                                field="sensor_nombre" 
                                header="Sensor" 
                                sortable
                                style={{ minWidth: '200px' }}
                            />
                            <Column 
                                field="valor" 
                                header="Valor" 
                                body={valorTemplate}
                                sortable
                                style={{ minWidth: '120px' }}
                            />
                            <Column 
                                header="Acciones" 
                                body={actionsTemplate}
                                style={{ width: '150px' }}
                                frozen
                                alignFrozen="right"
                            />
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageLecturasPage
