'use client'

import { useState, useEffect, useContext } from 'react'

import Link from 'next/link'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { FilterMatchMode } from 'primereact/api'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import AppContext from '@/context/appContext'


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
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useContext(AppContext)
    const { userInfo } = appState

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
        const { data, status, message } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/usuarios`,
            method: 'POST',
            body: {
                idCurrentUser: userInfo.id
            }
        })

        if (status === 'error') {
            console.log(message)
            showLoader(false)
            return false
        }

        setListUsers(data as User[])
        showLoader(false)
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

                const { status } = await ConsumerAPI({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/deleteRecord/${idRow}`,
                    method: 'DELETE'
                })

                if (status === 'error') {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el usuario',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
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