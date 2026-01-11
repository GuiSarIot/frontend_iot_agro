'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import RouterIcon from '@mui/icons-material/Router'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttBrokersService, type MqttBroker } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import stylesPage from './mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageMqttBrokersPageProps {
    infoPage?: InfoPage
}

interface BrokerQueryParams {
    search?: string
    protocol?: string
    active_only?: boolean
}

// ---- Componente principal ----
const ManageMqttBrokersPage: React.FC<ManageMqttBrokersPageProps> = ({
    infoPage = {
        title: 'Brokers MQTT',
        route: '/gestor_mqtt/brokers',
        role: 'Gestión de Brokers MQTT'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'mqtt_brokers',
        action: 'list'
    })

    // ---- Estados ----
    const [filteredBrokers, setFilteredBrokers] = useState<MqttBroker[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [protocolFilter, setProtocolFilter] = useState<string>('')
    const [activeFilter, setActiveFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // ---- Opciones de filtros ----
    const protocolOptions = [
        { label: 'Todos los protocolos', value: '' },
        { label: 'MQTT', value: 'mqtt' },
        { label: 'MQTTS', value: 'mqtts' },
        { label: 'WebSocket', value: 'ws' },
        { label: 'WebSocket Secure', value: 'wss' }
    ]

    const activeOptions = [
        { label: 'Todos', value: '' },
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' }
    ]

    // ---- Cargar datos ----
    const loadBrokers = useCallback(async () => {
        try {
            showLoader(true)
            const params: BrokerQueryParams = {}
            if (searchTerm) params.search = searchTerm
            if (protocolFilter) params.protocol = protocolFilter
            if (activeFilter) params.active_only = activeFilter === 'true'

            const response = await mqttBrokersService.getAll(params)
            setFilteredBrokers(response.results)
        } catch (error) {
            console.error('Error cargando brokers:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los brokers MQTT'
            })
        } finally {
            showLoader(false)
        }
    }, [searchTerm, protocolFilter, activeFilter, showLoader])

    useEffect(() => {
        changeTitle(infoPage.title)
        changeUserInfo({ ...userInfo, role: infoPage.role })
        showNavbar(true)
        loadBrokers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeTitle, infoPage.title, infoPage.role, showNavbar])

    // ---- Filtrado ----
    useEffect(() => {
        loadBrokers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, protocolFilter, activeFilter])

    // ---- Acciones ----
    const handleActivate = async (id: number) => {
        try {
            showLoader(true)
            await mqttBrokersService.activate(id)
            Swal.fire({
                icon: 'success',
                title: 'Broker activado',
                text: 'El broker ha sido activado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })
            loadBrokers()
        } catch (error) {
            console.error('Error activando broker:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo activar el broker'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleDeactivate = async (id: number) => {
        try {
            showLoader(true)
            await mqttBrokersService.deactivate(id)
            Swal.fire({
                icon: 'success',
                title: 'Broker desactivado',
                text: 'El broker ha sido desactivado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })
            loadBrokers()
        } catch (error) {
            console.error('Error desactivando broker:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo desactivar el broker'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleDelete = async (id: number, nombre: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el broker "${nombre}"`,
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
                await mqttBrokersService.delete(id)
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El broker ha sido eliminado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadBrokers()
            } catch (error) {
                console.error('Error eliminando broker:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el broker'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    // ---- Limpiar filtros ----
    const clearFilters = () => {
        setSearchTerm('')
        setProtocolFilter('')
        setActiveFilter('')
    }

    // ---- Templates de columnas ----
    const protocolTemplate = (rowData: MqttBroker) => {
        return <span className={stylesPage.badge}>{rowData.protocol_display}</span>
    }

    const tlsTemplate = (rowData: MqttBroker) => {
        return rowData.use_tls ? (
            <span className={stylesPage.badgeActive}>Sí</span>
        ) : (
            <span className={stylesPage.badgeInactive}>No</span>
        )
    }

    const statusTemplate = (rowData: MqttBroker) => {
        return rowData.is_active ? (
            <span className={stylesPage.badgeActive}>Activo</span>
        ) : (
            <span className={stylesPage.badgeInactive}>Inactivo</span>
        )
    }

    const actionsTemplate = (rowData: MqttBroker) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link href={`/gestor_mqtt/brokers/${rowData.id}`}>
                    <button
                        title="Ver/Editar"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <VisibilityIcon style={{ fontSize: '1.25rem', color: '#10b981' }} />
                    </button>
                </Link>
                
                {rowData.is_active ? (
                    <button
                        onClick={() => handleDeactivate(rowData.id)}
                        title="Desactivar"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ToggleOffIcon style={{ fontSize: '1.25rem', color: '#6b7280' }} />
                    </button>
                ) : (
                    <button
                        onClick={() => handleActivate(rowData.id)}
                        title="Activar"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ToggleOnIcon style={{ fontSize: '1.25rem', color: '#10b981' }} />
                    </button>
                )}

                <button
                    onClick={() => handleDelete(rowData.id, rowData.nombre)}
                    title="Eliminar"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <DeleteIcon style={{ fontSize: '1.25rem', color: '#6b7280' }} />
                </button>
            </div>
        )
    }

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.headerContent}>
                        <div className={stylesPage.titleSection}>
                            <div className={stylesPage.titleWrapper}>
                                <RouterIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Brokers MQTT</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Gestión de brokers MQTT para la comunicación de dispositivos
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
                            
                            <Link href="/gestor_mqtt/brokers/crear">
                                <Button
                                    icon={<AddIcon />}
                                    label="Nuevo Broker"
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
                                <label className={stylesPage.filterLabel}>Protocolo</label>
                                <Dropdown
                                    value={protocolFilter}
                                    options={protocolOptions}
                                    onChange={(e) => setProtocolFilter(e.value)}
                                    placeholder="Todos los protocolos"
                                    showClear
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Estado</label>
                                <Dropdown
                                    value={activeFilter}
                                    options={activeOptions}
                                    onChange={(e) => setActiveFilter(e.value)}
                                    placeholder="Todos"
                                    showClear
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

                {/* Tabla de brokers */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableContainer}>
                        <DataTable
                            value={filteredBrokers}
                            emptyMessage="No se encontraron brokers"
                            stripedRows
                            showGridlines
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                            <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                            <Column field="nombre" header="Nombre" sortable style={{ minWidth: '200px' }} />
                            <Column field="host" header="Host" sortable style={{ minWidth: '200px' }} />
                            <Column field="port" header="Puerto" sortable style={{ width: '100px' }} />
                            <Column 
                                field="protocol" 
                                header="Protocolo" 
                                body={protocolTemplate}
                                sortable 
                                style={{ width: '120px' }} 
                            />
                            <Column field="username" header="Usuario" style={{ minWidth: '150px' }} />
                            <Column 
                                field="use_tls" 
                                header="TLS" 
                                body={tlsTemplate}
                                style={{ width: '80px' }} 
                            />
                            <Column 
                                field="is_active" 
                                header="Estado" 
                                body={statusTemplate}
                                sortable 
                                style={{ width: '100px' }} 
                            />
                            <Column 
                                header="Acciones" 
                                body={actionsTemplate}
                                style={{ width: '180px' }}
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

export default ManageMqttBrokersPage
