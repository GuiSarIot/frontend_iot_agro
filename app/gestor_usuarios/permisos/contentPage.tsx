'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import CodeIcon from '@mui/icons-material/Code'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import SearchIcon from '@mui/icons-material/Search'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import { useAppContext } from '@/context/appContext'

import stylesPage from './contentPage.module.css'

// ---- Interfaces ----
interface PermisoFromBackend {
    id: number
    nombre: string
    codigo: string
    descripcion: string
    is_active: boolean
    created_at: string
    updated_at: string
}

interface PermisosApiResponse {
    count: number
    next: string | null
    previous: string | null
    results: PermisoFromBackend[]
}

interface Permiso {
    code: string
    name: string
    codigo: string
    description: string
    state: string
    created_at: string
}

// ---- Componente principal ----
const ContentPage: React.FC = () => {
    const { changeTitle, showNavbar, showLoader } = useAppContext()

    const [listPermisos, setListPermisos] = useState<Permiso[]>([])
    const [filteredPermisos, setFilteredPermisos] = useState<Permiso[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null)

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Permisos')
        loadPermisosData()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPermisos(listPermisos)
        } else {
            const filtered = listPermisos.filter(permiso => 
                permiso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                permiso.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                permiso.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredPermisos(filtered)
        }
    }, [searchTerm, listPermisos])

    const loadPermisosData = async () => {
        try {
            showLoader(true)
            const { data, status, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/permisos/`
            })
            
            if (status === 'error') {
                console.error('Error al cargar permisos:', message)
                showLoader(false)
                Swal.fire({
                    title: 'Error al cargar permisos',
                    text: message || 'No se pudieron cargar los permisos',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                })
                return false
            }
            
            console.log('Respuesta completa del backend:', data)
            
            // Verificar si la respuesta tiene estructura de paginación o es un array directo
            let permisosFromBackend: PermisoFromBackend[] = []
            
            if (Array.isArray(data)) {
                // Si es un array directo
                permisosFromBackend = data
            } else if (data && typeof data === 'object' && 'results' in data) {
                // Si tiene estructura de paginación
                const apiResponse = data as PermisosApiResponse
                permisosFromBackend = apiResponse.results || []
            } else {
                console.error('Estructura de datos no esperada:', data)
                showLoader(false)
                return false
            }
            
            console.log('Permisos extraídos:', permisosFromBackend)

            const permisosTransformed: Permiso[] = permisosFromBackend.map(permiso => ({
                code: String(permiso.id),
                name: permiso.nombre || '',
                codigo: permiso.codigo || '',
                description: permiso.descripcion || '',
                state: permiso.is_active ? 'Activo' : 'Inactivo',
                created_at: permiso.created_at || new Date().toISOString()
            }))
            
            console.log('Permisos transformados:', permisosTransformed)
            setListPermisos(permisosTransformed)
            setFilteredPermisos(permisosTransformed)
            showLoader(false)
            
        } catch (error) {
            console.error('Error en loadPermisosData:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al cargar los permisos',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const handleToggleState = async (permiso: Permiso) => {
        const newState = permiso.state === 'Activo' ? 'Inactivo' : 'Activo'
        const action = permiso.state === 'Activo' ? 'desactivar' : 'activar'
        const endpoint = permiso.state === 'Activo' ? 'deactivate' : 'activate'
        
        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} este permiso?`,
            text: `El permiso "${permiso.name}" será ${permiso.state === 'Activo' ? 'desactivado' : 'activado'}`,
            icon: 'question',
            showCancelButton: true,

            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar',
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `${action.charAt(0).toUpperCase() + action.slice(1)}ando permiso...`,
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
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/permisos/${permiso.code}/${endpoint}/`,
                    method: 'POST'
                })

                if (status === 'error') {
                    Swal.fire({
                        title: 'Error',
                        text: `No se pudo ${action} el permiso`,
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    })
                    return false
                }

                loadPermisosData()

                Swal.fire({
                    title: `Permiso ${permiso.state === 'Activo' ? 'desactivado' : 'activado'}`,
                    text: `El permiso se ha ${permiso.state === 'Activo' ? 'desactivado' : 'activado'} correctamente`,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                })
            }
        })
    }

    const handleDelete = async (permiso: Permiso) => {
        Swal.fire({
            title: '¿Estás seguro de eliminar este permiso?',
            text: 'No podrás revertir los cambios',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar',
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando permiso...',
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
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/permisos/${permiso.code}/`,
                    method: 'DELETE'
                })

                if (status === 'error') {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el permiso',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    })
                    return false
                }

                loadPermisosData()

                Swal.fire({
                    title: 'Permiso eliminado',
                    text: 'El permiso se ha eliminado correctamente',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                })
            }
        })
    }

    const handleViewDetails = (permiso: Permiso) => {
        setSelectedPermiso(permiso)
        setShowDetailsModal(true)
    }

    const renderPermisoCard = (permiso: Permiso) => {
        return (
            <div key={permiso.code} className={stylesPage.permisoCard}>
                <div className={stylesPage.cardHeader}>
                    <div className={stylesPage.cardTitle}>
                        <h3>{permiso.name}</h3>
                        <span className={`${stylesPage.badge} ${
                            permiso.state === 'Activo' ? stylesPage.badgeActive : stylesPage.badgeInactive
                        }`}>
                            {permiso.state}
                        </span>
                    </div>
                    <div className={stylesPage.cardActions}>
                        <button 
                            className={`${stylesPage.actionBtn} ${permiso.state === 'Activo' ? stylesPage.actionBtnToggleActive : stylesPage.actionBtnToggleInactive}`}
                            onClick={() => handleToggleState(permiso)}
                            title={permiso.state === 'Activo' ? 'Desactivar permiso' : 'Activar permiso'}
                        >
                            {permiso.state === 'Activo' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </button>
                        <Link 
                            href={`/gestor_usuarios/permisos/${permiso.code}`}
                            className={stylesPage.actionBtn}
                            title="Editar"
                        >
                            <EditIcon />
                        </Link>
                        <button 
                            className={`${stylesPage.actionBtn} ${stylesPage.actionBtnDelete}`}
                            onClick={() => handleDelete(permiso)}
                            title="Eliminar"
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>

                <div className={stylesPage.cardBody}>
                    <div className={stylesPage.cardInfo}>
                        <div className={stylesPage.infoItem}>
                            <CodeIcon className={stylesPage.infoIcon} />
                            <div className={stylesPage.infoContent}>
                                <span className={stylesPage.infoLabel}>Código</span>
                                <span className={stylesPage.infoValue}>{permiso.codigo}</span>
                            </div>
                        </div>

                        <div className={stylesPage.infoItem}>
                            <DescriptionIcon className={stylesPage.infoIcon} />
                            <div className={stylesPage.infoContent}>
                                <span className={stylesPage.infoLabel}>Descripción</span>
                                <span className={stylesPage.infoValue}>
                                    {permiso.description.length > 100 
                                        ? permiso.description.substring(0, 100) + '...' 
                                        : permiso.description}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        className={stylesPage.viewDetailsBtn}
                        onClick={() => handleViewDetails(permiso)}
                    >
                        Ver detalles completos
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={stylesPage.content}>
            <div className={stylesPage.permisosMainContainer}>
                <div className={stylesPage.titleSection}>
                    <div className={stylesPage.titleWrapper}>
                        <LockIcon className={stylesPage.titleIcon} />
                        <h1 className={stylesPage.pageTitle}>Gestión de permisos</h1>
                    </div>
                    <p className={stylesPage.pageSubtitle}>
                        Administra los permisos del sistema que pueden ser asignados a los roles
                    </p>
                </div>
                
                <div className={stylesPage.header}>
                    <div className={stylesPage.searchContainer}>
                        <div className={stylesPage.searchWrapper}>
                            <SearchIcon className={stylesPage.searchIcon} />
                            <InputText
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, código o descripción..."
                                className={stylesPage.searchInput}
                            />
                            {searchTerm && (
                                <button 
                                    className={stylesPage.clearButton}
                                    onClick={() => setSearchTerm('')}
                                    type="button"
                                    aria-label="Limpiar búsqueda"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                    <div className={stylesPage.btnNewPermiso}>
                        <Link href="/gestor_usuarios/permisos/crear">
                            <AddIcon />
                            <span>Nuevo permiso</span>
                        </Link>
                    </div>
                </div>

                <div className={stylesPage.cardsContainer}>
                    {filteredPermisos.length > 0 ? (
                        filteredPermisos.map(permiso => renderPermisoCard(permiso))
                    ) : (
                        <div className={stylesPage.emptyState}>
                            <p>No se encontraron permisos</p>
                        </div>
                    )}
                </div>

                {/* Modal de Detalles */}
                <Dialog
                    visible={showDetailsModal}
                    onHide={() => setShowDetailsModal(false)}
                    className={stylesPage.detailsModal}
                    style={{ width: '600px', maxWidth: '90vw' }}
                    breakpoints={{ '960px': '75vw', '640px': '95vw' }}
                    dismissableMask
                    header={false}
                    closable={true}
                    contentStyle={{
                        padding: '3rem 2.5rem',
                        textAlign: 'center',
                        background: '#ffffff',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            minWidth: '100px',
                            minHeight: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                            flexShrink: 0
                        }}>
                            <LockIcon style={{ fontSize: '50px', color: '#ffffff' }} />
                        </div>
                        <h2 style={{
                            fontSize: '30px',
                            fontWeight: 700,
                            color: '#2c3e50',
                            margin: '0 0 12px 0',
                            padding: 0,
                            lineHeight: 1.2,
                            textAlign: 'center',
                            letterSpacing: '-0.5px'
                        }}>Detalles del Permiso</h2>
                        <p style={{
                            fontSize: '17px',
                            color: '#7f8c8d',
                            margin: '0 0 24px 0',
                            padding: 0,
                            fontWeight: 500,
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}>{selectedPermiso?.name}</p>
                        
                        <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent 0%, #FF9800 50%, transparent 100%)',
                            margin: '0 auto 24px auto',
                            borderRadius: '4px'
                        }}></div>
                        
                        <div style={{ width: '100%', textAlign: 'left' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#7f8c8d',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Código</div>
                                <div style={{
                                    fontSize: '16px',
                                    color: '#2c3e50',
                                    padding: '12px 16px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace'
                                }}>{selectedPermiso?.codigo}</div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#7f8c8d',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Descripción</div>
                                <div style={{
                                    fontSize: '15px',
                                    color: '#495057',
                                    padding: '12px 16px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    lineHeight: 1.6
                                }}>{selectedPermiso?.description}</div>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#7f8c8d',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Estado</div>
                                <div style={{
                                    fontSize: '15px',
                                    padding: '12px 16px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        background: selectedPermiso?.state === 'Activo' ? '#d4edda' : '#f8d7da',
                                        color: selectedPermiso?.state === 'Activo' ? '#155724' : '#721c24'
                                    }}>
                                        {selectedPermiso?.state}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    )
}

export default ContentPage
