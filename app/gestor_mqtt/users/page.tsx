'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { emqxUsersService, type EmqxUser } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import stylesPage from '../brokers/mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface ManageEmqxUsersPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageEmqxUsersPage: React.FC<ManageEmqxUsersPageProps> = ({
    infoPage = {
        title: 'Usuarios EMQX',
        route: '/gestor_mqtt/users',
        role: 'Gestión de Usuarios EMQX'
    }
}) => {
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // Registrar acceso al módulo automáticamente
    useAccessLogger({ 
        customModule: 'emqx_users',
        action: 'list'
    })

    // ---- Estados ----
    const [users, setUsers] = useState<EmqxUser[]>([])
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [dispositivoFilter, setDispositivoFilter] = useState<number | null>(null)
    const [superuserFilter, setSuperuserFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState<boolean>(false)

    // ---- Opciones de filtros ----
    const superuserOptions = [
        { label: 'Todos', value: '' },
        { label: 'Superusuarios', value: 'true' },
        { label: 'Usuarios normales', value: 'false' }
    ]

    // ---- Cargar datos ----
    const loadDispositivos = useCallback(async () => {
        try {
            const response = await dispositivosService.getAll()
            setDispositivos(response.results)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }, [])

    const loadUsers = useCallback(async () => {
        try {
            showLoader(true)
            const params: Record<string, string | number | boolean> = {}
            if (dispositivoFilter) params.dispositivo = dispositivoFilter
            if (superuserFilter) params.is_superuser = superuserFilter === 'true'

            const response = await emqxUsersService.getAll(params)
            setUsers(response.results)
        } catch (error) {
            console.error('Error cargando usuarios:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los usuarios EMQX'
            })
        } finally {
            showLoader(false)
        }
    }, [dispositivoFilter, superuserFilter, showLoader])

    useEffect(() => {
        changeTitle(infoPage.title)
        changeUserInfo({ ...userInfo, role: infoPage.role })
        showNavbar(true)
        loadDispositivos()
        loadUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [changeTitle, infoPage.title, infoPage.role, showNavbar])

    // ---- Filtrado ----
    useEffect(() => {
        loadUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispositivoFilter, superuserFilter])

    // ---- Acciones ----
    const handleChangePassword = async (id: number, username: string) => {
        const { value: password } = await Swal.fire({
            title: `Cambiar contraseña de ${username}`,
            input: 'password',
            inputLabel: 'Nueva contraseña',
            inputPlaceholder: 'Ingrese la nueva contraseña',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe ingresar una contraseña'
                }
                if (value.length < 6) {
                    return 'La contraseña debe tener al menos 6 caracteres'
                }
            }
        })

        if (password) {
            try {
                showLoader(true)
                await emqxUsersService.changePassword(id, password)
                Swal.fire({
                    icon: 'success',
                    title: 'Contraseña actualizada',
                    text: `La contraseña de ${username} ha sido cambiada exitosamente`,
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error('Error cambiando contraseña:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cambiar la contraseña'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    const handleDelete = async (id: number, username: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el usuario "${username}"`,
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
                await emqxUsersService.delete(id)
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El usuario ha sido eliminado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                })
                loadUsers()
            } catch (error) {
                console.error('Error eliminando usuario:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el usuario'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    // ---- Limpiar filtros ----
    const clearFilters = () => {
        setDispositivoFilter(null)
        setSuperuserFilter('')
    }

    // ---- Templates de columnas ----
    const usernameTemplate = (rowData: EmqxUser) => {
        return <strong>{rowData.username}</strong>
    }

    const dispositivoTemplate = (rowData: EmqxUser) => {
        return rowData.dispositivo_nombre || (
            <span style={{ color: '#6c757d' }}>Sin asignar</span>
        )
    }

    const tipoTemplate = (rowData: EmqxUser) => {
        return rowData.is_superuser ? (
            <span className={stylesPage.badgeActive}>
                <SecurityIcon style={{ fontSize: '0.9rem', marginRight: '4px' }} />
                Superusuario
            </span>
        ) : (
            <span className={stylesPage.badge}>
                <PersonIcon style={{ fontSize: '0.9rem', marginRight: '4px' }} />
                Normal
            </span>
        )
    }

    const aclTemplate = (rowData: EmqxUser) => {
        return (
            <span className={stylesPage.badge}>
                {rowData.acl_rules_count} reglas
            </span>
        )
    }

    const createdTemplate = (rowData: EmqxUser) => {
        return new Date(rowData.created).toLocaleString('es-ES')
    }

    const actionsTemplate = (rowData: EmqxUser) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link href={`/gestor_mqtt/users/${rowData.id}`}>
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
                    onClick={() => handleChangePassword(rowData.id, rowData.username)}
                    title="Cambiar contraseña"
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
                    <VpnKeyIcon style={{ fontSize: '1.25rem', color: '#6b7280' }} />
                </button>

                <button
                    onClick={() => handleDelete(rowData.id, rowData.username)}
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
                                <PeopleIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Usuarios EMQX</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Gestión de usuarios para autenticación MQTT
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
                            
                            <Link href="/gestor_mqtt/users/crear">
                                <Button
                                    icon={<AddIcon />}
                                    label="Nuevo Usuario"
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
                                <label className={stylesPage.filterLabel}>Tipo</label>
                                <Dropdown
                                    value={superuserFilter}
                                    options={superuserOptions}
                                    onChange={(e) => setSuperuserFilter(e.value)}
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

                {/* Tabla de usuarios */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.tableContainer}>
                        <DataTable
                            value={users}
                            emptyMessage="No se encontraron usuarios"
                            stripedRows
                            showGridlines
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                            <Column 
                                field="username" 
                                header="Username" 
                                body={usernameTemplate}
                                sortable 
                                style={{ minWidth: '200px' }} 
                            />
                            <Column 
                                field="dispositivo_nombre" 
                                header="Dispositivo" 
                                body={dispositivoTemplate}
                                sortable 
                                style={{ minWidth: '180px' }} 
                            />
                            <Column 
                                field="is_superuser" 
                                header="Tipo" 
                                body={tipoTemplate}
                                sortable 
                                style={{ width: '180px' }} 
                            />
                            <Column 
                                field="acl_rules_count" 
                                header="Reglas ACL" 
                                body={aclTemplate}
                                sortable 
                                style={{ width: '120px' }} 
                            />
                            <Column 
                                field="created" 
                                header="Fecha Creación" 
                                body={createdTemplate}
                                sortable 
                                style={{ width: '180px' }} 
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

export default ManageEmqxUsersPage
