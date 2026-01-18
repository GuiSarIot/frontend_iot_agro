'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttTopicsService, type MqttTopic } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import stylesPage from '../brokers/mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageMqttTopicsPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageMqttTopicsPage: React.FC<ManageMqttTopicsPageProps> = ({
    infoPage = {
        title: 'Topics MQTT',
        route: '/gestor_mqtt/topics',
        role: 'Gestión de Topics MQTT'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'other',
        action: 'list'
    })

    // ---- Estados ----
    const [_topics, setTopics] = useState<MqttTopic[]>([])
    const [filteredTopics, setFilteredTopics] = useState<MqttTopic[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [tipoFilter, setTipoFilter] = useState<string>('')
    const [qosFilter, setQosFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // ---- Opciones de filtros ----
    const tipoOptions = [
        { label: 'Todos los tipos', value: '' },
        { label: 'Publish', value: 'publish' },
        { label: 'Subscribe', value: 'subscribe' },
        { label: 'Both', value: 'both' }
    ]

    const qosOptions = [
        { label: 'Todos los QoS', value: '' },
        { label: 'QoS 0', value: '0' },
        { label: 'QoS 1', value: '1' },
        { label: 'QoS 2', value: '2' }
    ]

    // ---- Cargar datos ----
    const loadTopics = useCallback(async () => {
        try {
            showLoader(true)
            const params: { search?: string; tipo?: string; qos?: number } = {}
            if (searchTerm) params.search = searchTerm
            if (tipoFilter) params.tipo = tipoFilter
            if (qosFilter) params.qos = parseInt(qosFilter)

            const response = await mqttTopicsService.getAll(params)
            setTopics(response.results)
            setFilteredTopics(response.results)
        } catch (error) {
            console.error('Error cargando topics:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los topics MQTT'
            })
        } finally {
            showLoader(false)
        }
    }, [searchTerm, tipoFilter, qosFilter, showLoader])

    useEffect(() => {
        changeTitle(infoPage.title)
        changeUserInfo({ ...userInfo, role: infoPage.role })
        showNavbar(true)
        loadTopics()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeTitle, infoPage.title, infoPage.role, showNavbar])

    // ---- Filtrado ----
    useEffect(() => {
        loadTopics()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, tipoFilter, qosFilter])

    // ---- Acciones ----
    const handleDelete = async (id: number, nombre: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el topic "${nombre}"`,
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
                await mqttTopicsService.delete(id)
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El topic ha sido eliminado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadTopics()
            } catch (error) {
                console.error('Error eliminando topic:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el topic'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    // ---- Limpiar filtros ----
    const clearFilters = () => {
        setSearchTerm('')
        setTipoFilter('')
        setQosFilter('')
    }

    // ---- Templates de columnas ----
    const patternTemplate = (rowData: MqttTopic) => {
        return (
            <code style={{ 
                background: '#f8f9fa', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '0.9em',
                color: '#147910'
            }}>
                {rowData.topic_pattern}
            </code>
        )
    }

    const tipoTemplate = (rowData: MqttTopic) => {
        return <span className={stylesPage.badge}>{rowData.tipo_display}</span>
    }

    const qosTemplate = (rowData: MqttTopic) => {
        return <span className={stylesPage.badge}>{rowData.qos_display}</span>
    }

    const retainTemplate = (rowData: MqttTopic) => {
        return rowData.retain ? (
            <span className={stylesPage.badgeActive}>Sí</span>
        ) : (
            <span className={stylesPage.badgeInactive}>No</span>
        )
    }

    const descripcionTemplate = (rowData: MqttTopic) => {
        return rowData.descripcion ? (
            <span title={rowData.descripcion}>
                {rowData.descripcion.substring(0, 50)}
                {rowData.descripcion.length > 50 ? '...' : ''}
            </span>
        ) : (
            <span style={{ color: '#6c757d' }}>-</span>
        )
    }

    const actionsTemplate = (rowData: MqttTopic) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link href={`/gestor_mqtt/topics/${rowData.id}`}>
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
                                <SettingsSuggestIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Topics MQTT</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Configuración de topics para la publicación y suscripción de mensajes
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
                            
                            <Link href="/gestor_mqtt/topics/crear">
                                <Button
                                    icon={<AddIcon />}
                                    label="Nuevo Topic"
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
                                <label className={stylesPage.filterLabel}>Tipo</label>
                                <Dropdown
                                    value={tipoFilter}
                                    options={tipoOptions}
                                    onChange={(e) => setTipoFilter(e.value)}
                                    placeholder="Todos los tipos"
                                    showClear
                                />
                            </div>

                            <div className={stylesPage.filterGroup}>
                                <label className={stylesPage.filterLabel}>QoS</label>
                                <Dropdown
                                    value={qosFilter}
                                    options={qosOptions}
                                    onChange={(e) => setQosFilter(e.value)}
                                    placeholder="Todos los QoS"
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

                {/* Tabla de topics */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableContainer}>
                        <DataTable
                            value={filteredTopics}
                            emptyMessage="No se encontraron topics"
                            stripedRows
                            showGridlines
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                            <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                            <Column field="nombre" header="Nombre" sortable style={{ minWidth: '200px' }} />
                            <Column 
                                field="topic_pattern" 
                                header="Patrón del Topic" 
                                body={patternTemplate}
                                sortable 
                                style={{ minWidth: '250px' }} 
                            />
                            <Column 
                                field="tipo" 
                                header="Tipo" 
                                body={tipoTemplate}
                                sortable 
                                style={{ width: '120px' }} 
                            />
                            <Column 
                                field="qos" 
                                header="QoS" 
                                body={qosTemplate}
                                sortable 
                                style={{ width: '150px' }} 
                            />
                            <Column 
                                field="retain" 
                                header="Retain" 
                                body={retainTemplate}
                                style={{ width: '100px' }} 
                            />
                            <Column 
                                field="descripcion" 
                                header="Descripción" 
                                body={descripcionTemplate}
                                style={{ minWidth: '200px' }} 
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

export default ManageMqttTopicsPage
