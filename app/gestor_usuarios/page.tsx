'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { FilterMatchMode } from 'primereact/api'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { Tooltip } from 'primereact/tooltip'
import Swal from 'sweetalert2'

import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import consumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import { useAppContext } from '@/context/appContext'


import stylesPage from './mainPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
    role: string
}

interface User {
    userNumDoc: string | number
    userName: string
    userLastName: string
    userEmailInstitutional: string
    userCenter: string
    centerName: string
    userCode: string
    isActive: boolean
    [key: string]: unknown
}

interface BackendUser {
    id: number
    first_name: string
    last_name: string
    email: string
    username?: string
    is_active?: boolean
    rol_detail?: {
        nombre: string
        nombre_display: string
    }
    [key: string]: unknown
}

interface BackendUsersResponse {
    count?: number
    next?: string | null
    previous?: string | null
    results?: BackendUser[]
}

// Define FilterState type for filters state
type FilterState = {
    global: {
        value: string | null
        matchMode: FilterMatchMode
    }
}

interface ManageUsersPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ManageUsersPage: React.FC<ManageUsersPageProps> = ({
    infoPage = {
        title: 'Listado de usuarios',
        route: '/gestor_usuarios',
        role: 'Gestión de usuarios'
    }
}) => {
    // * context
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    // * hooks
    const router = useRouter()

    // * states
    const [listUsers, setListUsers] = useState<User[]>([])
    const [filters, setFilters] = useState<FilterState>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    // * effects
    useEffect(() => {
        // * load init page
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title,
            role: infoPage.role
        })
        changeUserInfo({
            ...userInfo,
            role: infoPage.role
        })
        loadUsers()
        // eslint-disable-next-line
    }, [])

    // * methods
    const loadUsers = async () => {
        try {
            // Obtener token desde GetRoute
            const { token } = await GetRoute()
            
            if (!token || token === 'false') {
                console.error('Token no disponible')
                showLoader(false)
                Swal.fire({
                    title: 'Error',
                    text: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
                return false
            }

            const { data, status, message } = await consumerPublicAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (status === 'error') {
                console.error('Error al cargar usuarios:', message)
                showLoader(false)
                Swal.fire({
                    title: 'Error',
                    text: message || 'No se pudieron cargar los usuarios',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
                return false
            }

            // Adaptar la estructura de datos del backend al formato esperado por la tabla
            // La API retorna { count, next, previous, results }
            console.log('Datos recibidos del backend:', data)
            const backendResponse = data as BackendUsersResponse | BackendUser[]
            const usersData = Array.isArray(backendResponse) ? backendResponse : (backendResponse?.results || [])
            console.log('Users data extraído:', usersData)
            
            const adaptedUsers = Array.isArray(usersData) ? usersData.map((user: BackendUser) => {
                console.log('Adaptando usuario:', user)
                return {
                    userNumDoc: user.id?.toString() || '',
                    userName: user.first_name || user.username || '',
                    userLastName: user.last_name || '',
                    userEmailInstitutional: user.email || '',
                    userCenter: user.rol_detail?.nombre || 'Sin rol',
                    centerName: user.rol_detail?.nombre || 'Sin rol',
                    userCode: user.id?.toString() || '',
                    isActive: user.is_active ?? true,
                    ...user
                }
            }) : []
            
            console.log('Usuarios adaptados:', adaptedUsers)
            setListUsers(adaptedUsers as User[])
            showLoader(false)
            return true
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al cargar los usuarios',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return false
        }
    }

    const setGlobalFilterValue = (value) => {
        setFilters({
            ...filters,
            global: {
                value: value,
                matchMode: FilterMatchMode.CONTAINS
            }
        })
    }

    const handleDelete = (idRow) => {
        Swal.fire({
            title: '¿Estas seguro de eliminar este usuario?',
            text: 'No podrás revertir los cambios',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--text-color-secondary)',
            cancelButtonColor: 'var(--border-color-secondary)',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar',
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando usuario...',
                    text: 'Espere un momento por favor',
                    icon: 'info',
                    didOpen: () => {
                        Swal.showLoading()
                    },
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false
                })

                // Obtener token
                const { token } = await GetRoute()
                
                if (!token || token === 'false') {
                    Swal.fire({
                        title: 'Error',
                        text: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                    return false
                }

                const { status, message } = await consumerPublicAPI({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${idRow}/`,
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (status === 'error') {
                    Swal.fire({
                        title: 'Error',
                        text: message || 'No se pudo eliminar el usuario',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                    return false
                }

                loadUsers()

                Swal.fire({
                    title: 'Usuario eliminado',
                    text: 'El usuario se ha eliminado correctamente',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                })
            }
        })
    }

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'desactivar' : 'activar'
        const endpoint = currentStatus ? 'deactivate' : 'activate'

        const result = await Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
            text: `Está a punto de ${action} este usuario`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--primary)',
            cancelButtonColor: 'var(--text-color-secondary)',
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            showLoader(true)

            try {
                const { token } = await GetRoute()

                if (!token || token === 'false') {
                    Swal.fire({
                        title: 'Error',
                        text: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                    showLoader(false)
                    return
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/${endpoint}/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                showLoader(false)

                if (!response.ok) {
                    const errorData = await response.json()
                    Swal.fire({
                        title: 'Error',
                        text: errorData.detail || `No se pudo ${action} el usuario`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                    return
                }

                await loadUsers()

                Swal.fire({
                    title: '¡Éxito!',
                    text: `Usuario ${action}do correctamente`,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                })
            } catch (error) {
                showLoader(false)
                console.error(`Error al ${action} usuario:`, error)
                Swal.fire({
                    title: 'Error',
                    text: `Ocurrió un error al ${action} el usuario`,
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
            }
        }
    }

    // * renders
    const header = () => {
        return (
            <div className="table-header">
                <InputText
                    type="search"
                    onChange={event => setGlobalFilterValue(event.target.value)}
                    placeholder="Buscar por nombre, apellido o correo..."
                />
            </div>
        )
    }

    const renderActions = (idRow) => {
        return (
            <div>
                <Link href={`/gestor_usuarios/${idRow}`}>
                    <EditIcon />
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(idRow)}>
                    <DeleteIcon />
                </button>
            </div>
        )
    }

    const renderActiveStatus = (rowData: User) => {
        const tooltipId = `switch-${rowData.userCode}`
        const tooltipText = rowData.isActive ? 'Desactivar usuario' : 'Activar usuario'
        const switchClass = rowData.isActive ? 'user-switch-active' : 'user-switch-inactive'
        
        return (
            <>
                <InputSwitch 
                    id={tooltipId}
                    checked={rowData.isActive}
                    onChange={() => handleToggleActive(rowData.userCode, rowData.isActive)}
                    data-pr-tooltip={tooltipText}
                    data-pr-position="top"
                    className={switchClass}
                />
                <Tooltip target={`#${tooltipId}`} />
            </>
        )
    }

    return (
        <div className={stylesPage.content}>
            <div className="dataTableCustom">
                <div className={stylesPage.tableHeader}>
                    <button 
                        className={stylesPage.btnBack}
                        onClick={() => router.push('/dashboard')}
                        title="Volver al dashboard"
                    >
                        <ArrowBackIcon />
                    </button>
                    <h2>Listado de usuarios</h2>
                </div>
                <DataTable
                    value={listUsers}
                    tableStyle={{ width: '100%' }}
                    paginator
                    rows={10}
                    dataKey="userNumDoc"
                    header={header()}
                    emptyMessage="No hay usuarios encontrados"
                    filters={filters}
                    globalFilterFields={['userName', 'userLastName', 'userEmailInstitutional']}
                    onFilter={(e) => setFilters(e.filters as FilterState)}
                >
                    <Column field="userNumDoc" header="ID" />
                    <Column field="userName" header="Nombres" />
                    <Column field="userLastName" header="Apellidos" />
                    <Column field="userEmailInstitutional" header="Correo" />
                    <Column
                        field="centerName"
                        header="Rol"
                        body={rowData => rowData.centerName}
                    />
                    <Column
                        header="Estado"
                        body={renderActiveStatus}
                        style={{ width: '100px', textAlign: 'center' }}
                    />
                    <Column
                        header="Acciones"
                        body={rowData => renderActions(rowData.userCode)}
                        style={{ width: '120px' }}
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default ManageUsersPage