'use client'

import { useState, useEffect, useContext } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'
import PropTypes from 'prop-types'
import Link from 'next/link'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Swal from 'sweetalert2'
import AppContext from '@/context/appContext'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import stylesPage from './mainPage.module.css'
import SaveRoute from '@/components/protectedRoute/saveRoute'

const ManageUsersPage = ({
    infoPage = {
        title: 'Listado de usuarios',
        route: '/gestor_usuarios',
        role: 'Gestión de usuarios'
    }
}) => {

    //* context
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useContext(AppContext.Context)
    const { userInfo } = appState
    console.log(userInfo)
    //* states
    const [listUsers, setListUsers] = useState([])
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    //* effects
    useEffect(() => {
        //* load init page
        showLoader(true)
        window.innerWidth <= 1380 ? showNavbar(false) : showNavbar(true)
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

    }, [])

    //* methods
    const loadUsers = async () => {
        const { data, status, message } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/usuarios`,
            method: 'POST',
            body: {
                idCurrentUser: userInfo.id,
            }
        })

        if (status === 'error') {
            console.log(message)
            showLoader(false)
            return false
        }

        setListUsers(data)
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
                    allowEnterKey: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
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

    //* renders
    const header = () => {
        return (
            <div className="table-header">
                <InputText type="search" onChange={(event) => setGlobalFilterValue(event.target.value)} placeholder="Buscar..." />
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
                <DataTable value={listUsers} tableStyle={{ width: '100%' }} paginator rows={10} dataKey="userNumDoc" header={header()} filters={filters} emptyMessage="No hay usuarios encontrados" >
                    <Column field="userNumDoc" header="Num. doc" />
                    <Column field="userName" header="Nombres" />
                    <Column field="userLastName" header="Apellidos" />
                    <Column field="userEmailInstitutional" header="Correo" />
                    <Column field="centerName" header="Centro" body={(rowData) => {
                        return `${rowData.userCenter} - ${rowData.centerName}`
                    }} />
                    <Column header="Acciones" body={(rowData) => renderActions(rowData.userCode)} />
                </DataTable>
            </div>
        </div>
    )
}

ManageUsersPage.propTypes = {
    infoPage: PropTypes.object
}

export default ManageUsersPage