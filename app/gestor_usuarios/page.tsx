'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { FilterMatchMode } from 'primereact/api'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
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
    [key: string]: unknown
}

interface BackendUser {
    id: number
    first_name: string
    last_name: string
    email: string
    rol_detail?: {
        nombre: string
        nombre_display: string
    }
    [key: string]: unknown
}

// Define FilterState type for filters state
type FilterState = {
    global: {
        value: string | null
        matchMode: string
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
        // Validar que el usuario esté autenticado
        if (!userInfo.id) {
            console.error('Usuario no autenticado')
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: 'Usuario no autenticado. Por favor inicia sesión nuevamente.',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            return false
        }

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
                url: `${process.env.NEXT_PUBLIC_API_URL}/users/`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (status === 'error') {
                console.error('Error al cargar usuarios:', message)
                Swal.fire({
                    title: 'Error',
                    text: message || 'No se pudieron cargar los usuarios',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
                showLoader(false)
                return false
            }

            // Adaptar la estructura de datos del backend al formato esperado por la tabla
            const adaptedUsers = Array.isArray(data) ? data.map((user: BackendUser) => ({
                userNumDoc: user.id || '',
                userName: user.first_name || '',
                userLastName: user.last_name || '',
                userEmailInstitutional: user.email || '',
                userCenter: user.rol_detail?.nombre || '',
                centerName: user.rol_detail?.nombre_display || '',
                userCode: user.id || '',
                ...user
            })) : []

            setListUsers(adaptedUsers as User[])
            showLoader(false)
        } catch (error) {
            console.error('Error al cargar usuarios:', error)
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al cargar los usuarios',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
            showLoader(false)
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
                    url: `${process.env.NEXT_PUBLIC_API_URL}/users/${idRow}/`,
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

    // * renders
    const header = () => {
        return (
            <div className="table-header">
                <InputText
                    type="search"
                    onChange={event => setGlobalFilterValue(event.target.value)}
                    placeholder="Buscar..."
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
                >
                    <Column field="userNumDoc" header="Num. doc" />
                    <Column field="userName" header="Nombres" />
                    <Column field="userLastName" header="Apellidos" />
                    <Column field="userEmailInstitutional" header="Correo" />
                    <Column
                        field="centerName"
                        header="Centro"
                        body={rowData => `${rowData.userCenter} - ${rowData.centerName}`}
                    />
                    <Column
                        header="Acciones"
                        body={rowData => renderActions(rowData.userCode)}
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default ManageUsersPage