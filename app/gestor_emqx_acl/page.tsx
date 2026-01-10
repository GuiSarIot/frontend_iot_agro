'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FilterListIcon from '@mui/icons-material/FilterList'
import ShieldIcon from '@mui/icons-material/Shield'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'


import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { emqxAclService, type EmqxAcl } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../gestor_mqtt_brokers/mainPage.module.css'

const EmqxAclPage = () => {
    const router = useRouter()
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'emqx_acl',
        action: 'list'
    })

    // ---- Estados ----
    const [acls, setAcls] = useState<EmqxAcl[]>([])
    const [filteredAcls, setFilteredAcls] = useState<EmqxAcl[]>([])
    const [searchUsername, setSearchUsername] = useState('')
    const [searchTopic, setSearchTopic] = useState('')
    const [searchAction, setSearchAction] = useState<string>('')
    const [searchPermission, setSearchPermission] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    const loadAcls = useCallback(async () => {
        try {
            showLoader(true)
            const response = await emqxAclService.getAll()
            setAcls(response.results)
            setFilteredAcls(response.results)
        } catch (error) {
            console.error('Error cargando ACLs:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las reglas ACL'
            })
        } finally {
            showLoader(false)
        }
    }, [showLoader])

    // ---- Cargar datos ----
    useEffect(() => {
        loadAcls()
    }, [loadAcls])

    // ---- Filtrado ----
    const applyFilters = useCallback(() => {
        let filtered = [...acls]

        if (searchUsername) {
            filtered = filtered.filter(acl =>
                acl.username.toLowerCase().includes(searchUsername.toLowerCase())
            )
        }

        if (searchTopic) {
            filtered = filtered.filter(acl =>
                acl.topic.toLowerCase().includes(searchTopic.toLowerCase())
            )
        }

        if (searchAction) {
            filtered = filtered.filter(acl => acl.action === searchAction)
        }

        if (searchPermission) {
            filtered = filtered.filter(acl => acl.permission === searchPermission)
        }

        setFilteredAcls(filtered)
    }, [searchUsername, searchTopic, searchAction, searchPermission, acls])

    useEffect(() => {
        applyFilters()
    }, [applyFilters])

    const handleClearFilters = () => {
        setSearchUsername('')
        setSearchTopic('')
        setSearchAction('')
        setSearchPermission('')
    }

    // ---- Manejadores ----
    const handleCreate = () => {
        router.push('/gestor_emqx_acl/crear')
    }

    const handleEdit = (aclId: number) => {
        router.push(`/gestor_emqx_acl/${aclId}`)
    }

    const handleDelete = async (acl: EmqxAcl) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Está seguro?',
            html: `
                Se eliminará la regla ACL:<br/>
                <strong>Usuario:</strong> ${acl.username}<br/>
                <strong>Topic:</strong> ${acl.topic}<br/>
                <strong>Acción:</strong> ${acl.action}<br/>
                <strong>Permiso:</strong> ${acl.permission}
            `,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        })

        if (result.isConfirmed) {
            try {
                showLoader(true)
                await emqxAclService.delete(acl.id)

                Swal.fire({
                    icon: 'success',
                    title: 'ACL eliminada',
                    text: 'La regla ha sido eliminada exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                })

                loadAcls()
            } catch (error: unknown) {
                console.error('Error eliminando ACL:', error)
                const errorMessage = error instanceof Error && 'response' in error 
                    ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                    : 'No se pudo eliminar la regla ACL'
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage
                })
            } finally {
                showLoader(false)
            }
        }
    }

    // ---- Templates ----
    const actionBodyTemplate = (rowData: EmqxAcl) => {
        const actionLabels: Record<string, string> = {
            publish: 'Publicar',
            subscribe: 'Suscribir',
            all: 'Ambos'
        }
        return actionLabels[rowData.action] || rowData.action
    }

    const permissionBodyTemplate = (rowData: EmqxAcl) => {
        const color = rowData.permission === 'allow' ? '#28a745' : '#dc3545'
        const text = rowData.permission === 'allow' ? 'Permitir' : 'Denegar'

        return (
            <span style={{ 
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                background: color + '20',
                color: color,
                fontWeight: 600,
                fontSize: '0.875rem'
            }}>
                {text}
            </span>
        )
    }

    const actionsBodyTemplate = (rowData: EmqxAcl) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                    onClick={() => handleEdit(rowData.id)}
                    title="Editar"
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
                    <EditIcon style={{ fontSize: '1.25rem', color: '#6b7280' }} />
                </button>
                <button
                    onClick={() => handleDelete(rowData)}
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

    const actionOptions = [
        { label: 'Todos', value: '' },
        { label: 'Publicar', value: 'publish' },
        { label: 'Suscribir', value: 'subscribe' },
        { label: 'Ambos', value: 'all' }
    ]

    const permissionOptions = [
        { label: 'Todos', value: '' },
        { label: 'Permitir', value: 'allow' },
        { label: 'Denegar', value: 'deny' }
    ]

    return (
        <div className={styles.containerPage}>
            <div className={styles.mainCard}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <div className={styles.titleWrapper}>
                                <ShieldIcon className={styles.titleIcon} />
                                <div>
                                    <h1 className={styles.pageTitle}>Reglas ACL de EMQX</h1>
                                    <p className={styles.pageSubtitle}>
                                        Gestione el control de acceso a topics MQTT
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <Button
                                icon={<FilterListIcon />}
                                label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                                onClick={() => setShowFilters(!showFilters)}
                                severity="secondary"
                                outlined
                            />
                            <Button
                                icon={<AddIcon />}
                                label="Nueva Regla ACL"
                                onClick={handleCreate}
                                severity="success"
                            />
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className={styles.filtersSection}>
                        <div className={styles.filtersGrid}>
                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Username</label>
                                <InputText
                                    value={searchUsername}
                                    onChange={(e) => setSearchUsername(e.target.value)}
                                    placeholder="Buscar por username..."
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Topic</label>
                                <InputText
                                    value={searchTopic}
                                    onChange={(e) => setSearchTopic(e.target.value)}
                                    placeholder="Buscar por topic..."
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Acción</label>
                                <Dropdown
                                    value={searchAction}
                                    options={actionOptions}
                                    onChange={(e) => setSearchAction(e.value)}
                                    placeholder="Todas"
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label className={styles.filterLabel}>Permiso</label>
                                <Dropdown
                                    value={searchPermission}
                                    options={permissionOptions}
                                    onChange={(e) => setSearchPermission(e.value)}
                                    placeholder="Todos"
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <Button
                                    label="Limpiar filtros"
                                    onClick={handleClearFilters}
                                    severity="secondary"
                                    outlined
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla */}
                <div className={styles.tableSection}>
                    <DataTable
                        value={filteredAcls}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        emptyMessage="No se encontraron reglas ACL"
                        stripedRows
                        showGridlines
                    >
                        <Column field="id" header="ID" sortable style={{ width: '80px' }} />
                        <Column field="username" header="Username" sortable />
                        <Column field="topic" header="Topic" sortable />
                        <Column 
                            field="action" 
                            header="Acción" 
                            body={actionBodyTemplate} 
                            sortable
                            style={{ width: '120px' }}
                        />
                        <Column 
                            field="permission" 
                            header="Permiso" 
                            body={permissionBodyTemplate} 
                            sortable
                            style={{ width: '120px' }}
                        />
                        <Column
                            header="Acciones"
                            body={actionsBodyTemplate}
                            style={{ width: '150px', textAlign: 'center' }}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default EmqxAclPage
