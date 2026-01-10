'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DevicesIcon from '@mui/icons-material/Devices'
import ErrorIcon from '@mui/icons-material/Error'
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { mqttDeviceConfigService, mqttBrokersService, type MqttDeviceConfig, type MqttBroker } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import stylesPage from '../gestor_mqtt_brokers/mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageMqttDeviceConfigPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageMqttDeviceConfigPage: React.FC<ManageMqttDeviceConfigPageProps> = ({
    infoPage = {
        title: 'Configuración MQTT de Dispositivos',
        route: '/gestor_mqtt_device_config',
        role: 'Gestión de Configuración MQTT'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'mqtt_device_config',
        action: 'list'
    })

    // ---- Estados ----
    const [configs, setConfigs] = useState<MqttDeviceConfig[]>([])
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [brokers, setBrokers] = useState<MqttBroker[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [dispositivoFilter, setDispositivoFilter] = useState<number | null>(null)
    const [brokerFilter, setBrokerFilter] = useState<number | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('')

    // ---- Opciones de filtros ----
    const statusOptions = [
        { label: 'Todos', value: '' },
        { label: 'Conectado', value: 'connected' },
        { label: 'Desconectado', value: 'disconnected' },
        { label: 'Error', value: 'error' }
    ]

    // ---- Cargar datos ----
    const loadConfigs = useCallback(async () => {
        try {
            showLoader(true)
            const params: Record<string, number | string> = {}
            if (dispositivoFilter) params.dispositivo = dispositivoFilter
            if (brokerFilter) params.broker = brokerFilter
            if (statusFilter) params.connection_status = statusFilter

            const response = await mqttDeviceConfigService.getAll(params)
            setConfigs(response.results)
        } catch (error) {
            console.error('Error cargando configuraciones:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las configuraciones MQTT'
            })
        } finally {
            showLoader(false)
        }
    }, [showLoader, dispositivoFilter, brokerFilter, statusFilter])

    const loadInitialData = useCallback(async () => {
        try {
            showLoader(true)
            const [dispositivosRes, brokersRes] = await Promise.all([
                dispositivosService.getAll(),
                mqttBrokersService.getAll()
            ])
            setDispositivos(dispositivosRes.results)
            setBrokers(brokersRes.results)
            await loadConfigs()
        } catch (error) {
            console.error('Error cargando datos iniciales:', error)
        } finally {
            showLoader(false)
        }
    }, [showLoader, loadConfigs])

    useEffect(() => {
        changeTitle(infoPage.title)
        changeUserInfo({ ...userInfo, role: infoPage.role })
        showNavbar(true)
        loadInitialData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeTitle, infoPage.title, infoPage.role, showNavbar])

    // ---- Filtrado ----
    useEffect(() => {
        if (dispositivos.length > 0 && brokers.length > 0) {
            loadConfigs()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispositivoFilter, brokerFilter, statusFilter, dispositivos.length, brokers.length])

    // ---- Acciones ----
    const handleDelete = async (id: number, dispositivoNombre: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará la configuración para "${dispositivoNombre}"`,
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
                await mqttDeviceConfigService.delete(id)
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'La configuración ha sido eliminada exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadConfigs()
            } catch (error) {
                console.error('Error eliminando configuración:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la configuración'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected':
                return <CheckCircleIcon sx={{ color: '#28a745', fontSize: 20 }} />
            case 'disconnected':
                return <CancelIcon sx={{ color: '#6c757d', fontSize: 20 }} />
            case 'error':
                return <ErrorIcon sx={{ color: '#dc3545', fontSize: 20 }} />
            default:
                return null
        }
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'connected':
                return stylesPage.badgeActive
            case 'disconnected':
                return stylesPage.badgeInactive
            case 'error':
                return stylesPage.badge
            default:
                return stylesPage.badge
        }
    }

    // ---- Limpiar filtros ----
    const clearFilters = () => {
        setDispositivoFilter(null)
        setBrokerFilter(null)
        setStatusFilter('')
    }

    // ---- Templates de columnas ----
    const dispositivoTemplate = (rowData: MqttDeviceConfig) => {
        return <strong>{rowData.dispositivo_nombre}</strong>
    }

    const qosTemplate = (rowData: MqttDeviceConfig) => {
        return <span className={stylesPage.badge}>{rowData.qos_display}</span>
    }

    const connectionStatusTemplate = (rowData: MqttDeviceConfig) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getStatusIcon(rowData.connection_status)}
                <span className={getStatusBadgeClass(rowData.connection_status)}>
                    {rowData.connection_status_display}
                </span>
            </div>
        )
    }

    const lastConnectionTemplate = (rowData: MqttDeviceConfig) => {
        if (!rowData.last_connection) {
            return <span style={{ color: '#6c757d' }}>-</span>
        }
        return new Date(rowData.last_connection).toLocaleString('es-ES')
    }

    const actionsTemplate = (rowData: MqttDeviceConfig) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link href={`/gestor_mqtt_device_config/${rowData.id}`}>
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

                <button
                    onClick={() => handleDelete(rowData.id, rowData.dispositivo_nombre)}
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

    const dispositivoOptions = [
        { label: 'Todos los dispositivos', value: null },
        ...dispositivos.map(d => ({ label: d.nombre, value: d.id }))
    ]

    const brokerOptions = [
        { label: 'Todos los brokers', value: null },
        ...brokers.map(b => ({ label: b.nombre, value: b.id }))
    ]

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.headerContent}>
                        <div className={stylesPage.titleSection}>
                            <div className={stylesPage.titleWrapper}>
                                <DevicesIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Configuración MQTT de Dispositivos</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Gestión de configuración MQTT por dispositivo
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
                            
                            <Link href="/gestor_mqtt_device_config/crear">
                                <Button
                                    icon={<AddIcon />}
                                    label="Nueva Configuración"
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
                                    value={dispositivoFilter}
                                    options={dispositivoOptions}
                                    onChange={(e) => setDispositivoFilter(e.value)}
                                    placeholder="Todos los dispositivos"
                                    showClear
                                    filter
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Broker</label>
                                <Dropdown
                                    value={brokerFilter}
                                    options={brokerOptions}
                                    onChange={(e) => setBrokerFilter(e.value)}
                                    placeholder="Todos los brokers"
                                    showClear
                                    filter
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>Estado</label>
                                <Dropdown
                                    value={statusFilter}
                                    options={statusOptions}
                                    onChange={(e) => setStatusFilter(e.value)}
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

                {/* Tabla de configuraciones */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableContainer}>
                        <DataTable
                            value={configs}
                            emptyMessage="No se encontraron configuraciones"
                            stripedRows
                            showGridlines
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                            <Column 
                                field="dispositivo_nombre" 
                                header="Dispositivo" 
                                body={dispositivoTemplate}
                                sortable 
                                style={{ minWidth: '200px' }} 
                            />
                            <Column 
                                field="broker_nombre" 
                                header="Broker" 
                                sortable 
                                style={{ minWidth: '180px' }} 
                            />
                            <Column 
                                field="publish_topic_nombre" 
                                header="Topic Publicación" 
                                sortable 
                                style={{ minWidth: '200px' }} 
                            />
                            <Column 
                                field="qos" 
                                header="QoS" 
                                body={qosTemplate}
                                sortable 
                                style={{ width: '100px' }} 
                            />
                            <Column 
                                field="connection_status" 
                                header="Estado Conexión" 
                                body={connectionStatusTemplate}
                                sortable 
                                style={{ width: '180px' }} 
                            />
                            <Column 
                                field="last_connection" 
                                header="Última Conexión" 
                                body={lastConnectionTemplate}
                                sortable 
                                style={{ width: '180px' }} 
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

export default ManageMqttDeviceConfigPage
