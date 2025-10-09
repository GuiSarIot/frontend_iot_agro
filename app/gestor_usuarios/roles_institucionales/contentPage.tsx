'use client'

import { useContext, useState, useEffect } from 'react'

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

import stylesPage from './contentPage.module.css'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
}

interface InstitutionalRole {
    code: string
    name: string
    description: string
    state: string
    access_level: string
    access_roles: string[]
}

interface FilterState {
    global: {
        value: string | null
        matchMode: string
    }
}

interface ContentPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ContentPage: React.FC<ContentPageProps> = ({
    infoPage = {
        title: 'Roles institucionales',
        route: '/gestor_usuarios/roles_institucionales'
    }
}) => {
    // * context
    const { changeTitle, showNavbar, showLoader } = useContext(AppContext)

    // * states
    const [listRolIn, setListRolIn] = useState<InstitutionalRole[]>([])
    const [filters, setFilters] = useState<FilterState>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    // * effects
    useEffect(() => {
        showLoader(true)
        if (window.innerWidth <= 1380) {
            showNavbar(false)
        } else {
            showNavbar(true)
        }
        changeTitle(infoPage.title)
        SaveRoute({
            title: infoPage.title,
            routeInfo: infoPage.route
        })
        loadRolsIn()
        // eslint-disable-next-line
    }, [])

    // * methods
    const loadRolsIn = async () => {
        const { data, status, message } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/get_roles_institucionales`
        })
        if (status === 'error') {
            console.log(message)
            showLoader(false)
            return false
        }
        setListRolIn(data as InstitutionalRole[])
        showLoader(false)
    }

    const setGlobalFilterValue = (value: string) => {
        setFilters({
            ...filters,
            global: {
                value: value,
                matchMode: FilterMatchMode.CONTAINS
            }
        })
    }

    const handleDelete = (idRow: string) => {
        Swal.fire({
            title: '¿Estas seguro de eliminar este rol institucional?',
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
                    title: 'Eliminando rol institucional...',
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
                    url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/deleteRecordRol/${idRow}`,
                    method: 'DELETE'
                })

                if (status === 'error') {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el rol institucional',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    })
                    return false
                }

                loadRolsIn()

                Swal.fire({
                    title: 'Rol institucional eliminado',
                    text: 'El rol institucional se ha eliminado correctamente',
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

    const renderActions = (idRow: string) => {
        return (
            <div>
                <Link href={`/gestor_usuarios/roles_institucionales/${idRow}`}>
                    <EditIcon />
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(idRow)}>
                    <DeleteIcon />
                </button>
            </div>
        )
    }

    const renderRolsAsignated = (rols: string[]) => {
        return rols.map((rol, index) => (
            <div key={index} className={stylesPage.itemData}>
                {rol}
            </div>
        ))
    }

    return (
        <div className={stylesPage.content}>
            <div className={stylesPage.btnNewRolin}>
                <Link href="/gestor_usuarios/roles_institucionales/crear">
                    Nuevo rol institucional
                </Link>
            </div>
            <div className={`dataTableCustom ${stylesPage.table}`}>
                <DataTable
                    value={listRolIn}
                    tableStyle={{ width: '100%' }}
                    paginator
                    rows={10}
                    dataKey="code"
                    header={header()}
                    emptyMessage="No registros disponibles"
                >
                    <Column field="name" header="Nombre" />
                    <Column field="description" header="Descripción" />
                    <Column field="state" header="Estado" />
                    <Column field="access_level" header="Nivel de acceso" />
                    <Column
                        field="access_roles"
                        header="Roles asigandos"
                        body={({ access_roles }: { access_roles: string[] }) =>
                            access_roles.length > 0
                                ? renderRolsAsignated(access_roles)
                                : 'No hay roles registrados'
                        }
                    />
                    <Column
                        header="Acciones"
                        body={(rowData: InstitutionalRole) => renderActions(rowData.code)}
                    />
                </DataTable>
            </div>
        </div>
    )
}

export default ContentPage