'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { mqttCredentialsService, type MqttCredential } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import stylesPage from './mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageMqttCredentialsPageProps {
    infoPage?: InfoPage
}

interface MqttCredentialFilters {
    search?: string
    dispositivo?: number
    active_only?: boolean
}

// ---- Componente principal ----
const ManageMqttCredentialsPage: React.FC<ManageMqttCredentialsPageProps> = ({
    infoPage = {
        title: 'Credenciales MQTT',
        route: '/gestor_mqtt/credentials',
        role: 'Gestión de Credenciales MQTT'
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
    const [filteredCredentials, setFilteredCredentials] = useState<MqttCredential[]>([])
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [dispositivoFilter, setDispositivoFilter] = useState<number | null>(null)
    const [activeFilter, setActiveFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // ---- Opciones de filtros ----
    const activeOptions = [
        { label: 'Todos', value: '' },
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' }
    ]

    // ---- Cargar datos ----
    const loadDispositivos = async () => {
        try {
            const response = await dispositivosService.getAll()
            setDispositivos(response.results)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }

    const loadCredentials = useCallback(async () => {
        try {
            showLoader(true)
            const params: MqttCredentialFilters = {}
            if (searchTerm) params.search = searchTerm
            if (dispositivoFilter) params.dispositivo = dispositivoFilter
            if (activeFilter) params.active_only = activeFilter === 'true'

            const response = await mqttCredentialsService.getAll(params)
            setFilteredCredentials(response.results)
        } catch (error) {
            console.error('Error cargando credenciales:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las credenciales MQTT'
            })
        } finally {
            showLoader(false)
        }
    }, [searchTerm, dispositivoFilter, activeFilter, showLoader])

    // ---- Cargar datos iniciales ----
    useEffect(() => {
        changeTitle(infoPage.title)
        changeUserInfo({ ...userInfo, role: infoPage.role })
        showNavbar(true)
        loadDispositivos()
        loadCredentials()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeTitle, infoPage.title, infoPage.role, showNavbar])

    // ---- Filtrado ----
    useEffect(() => {
        loadCredentials()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, dispositivoFilter, activeFilter])

    // ---- Acciones ----
    const handleDelete = async (id: number, clientId: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará la credencial "${clientId}"`,
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
                await mqttCredentialsService.delete(id)
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'La credencial ha sido eliminada exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadCredentials()
            } catch (error) {
                console.error('Error eliminando credencial:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la credencial'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    // ---- Limpiar filtros ----
    const clearFilters = () => {
        setSearchTerm('')
        setDispositivoFilter(null)
        setActiveFilter('')
    }

    // ---- Templates de columnas ----
    const passwordTemplate = (rowData: MqttCredential) => {
        return rowData.has_password ? (
            <span className={stylesPage.badgeSuccess}>Configurada</span>
        ) : (
            <span className={stylesPage.badgeWarning}>No configurada</span>
        )
    }

    const certTemplate = (rowData: MqttCredential) => {
        return rowData.use_device_cert ? (
            rowData.has_cert ? (
                <span className={stylesPage.badgeSuccess}>Sí</span>
            ) : (
                <span className={stylesPage.badgeWarning}>Pendiente</span>
            )
        ) : (
            <span className={stylesPage.badge}>No</span>
        )
    }

    const statusTemplate = (rowData: MqttCredential) => {
        return rowData.is_active ? (
            <span className={stylesPage.badgeActive}>Activo</span>
        ) : (
            <span className={stylesPage.badgeInactive}>Inactivo</span>
        )
    }

    const actionsTemplate = (rowData: MqttCredential) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link href={`/gestor_mqtt/credentials/${rowData.id}`}>
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
                    onClick={() => handleDelete(rowData.id, rowData.client_id)}
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

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.headerContent}>
                        <div className={stylesPage.titleSection}>
                            <div className={stylesPage.titleWrapper}>
                                <VpnKeyIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Credenciales MQTT</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Administración de credenciales de autenticación para MQTT
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
                            
                            <Link href="/gestor_mqtt/credentials/crear">
                                <Button
                                    icon={<AddIcon />}
                                    label="Nueva Credencial"
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

                {/* Tabla de credenciales */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableContainer}>
                        <DataTable
                            value={filteredCredentials}
                            emptyMessage="No se encontraron credenciales"
                            stripedRows
                            showGridlines
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                            <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                            <Column field="dispositivo_nombre" header="Dispositivo" sortable style={{ minWidth: '200px' }} />
                            <Column field="client_id" header="Client ID" sortable style={{ minWidth: '200px' }} />
                            <Column field="username" header="Username" sortable style={{ minWidth: '200px' }} />
                            <Column 
                                field="has_password" 
                                header="Contraseña" 
                                body={passwordTemplate}
                                style={{ width: '140px' }} 
                            />
                            <Column 
                                field="use_device_cert" 
                                header="Certificado" 
                                body={certTemplate}
                                style={{ width: '120px' }} 
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

export default ManageMqttCredentialsPage
