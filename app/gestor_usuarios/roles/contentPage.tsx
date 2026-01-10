'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import SecurityIcon from '@mui/icons-material/Security'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import { useAppContext } from '@/context/appContext'

import stylesPage from './contentPage.module.css'

// ---- Interfaces ----
interface Permiso {
    id: number
    nombre: string
    codigo: string
    descripcion: string
    created_at: string
}

interface RolFromBackend {
    id: number
    nombre: string
    descripcion: string
    is_active: boolean
    permisos: Permiso[]
    created_at: string
    updated_at: string
}

interface RolesApiResponse {
    count: number
    next: string | null
    previous: string | null
    results: RolFromBackend[]
}

interface InstitutionalRole {
    code: string
    name: string
    description: string
    state: string
    access_level: string
    access_roles: string[]
    users_count?: number
    assigned_users?: Array<{ username: string; full_name: string }>
}

interface UsuarioFromBackend {
    username?: string
    email?: string
    full_name?: string
    nombre?: string
    first_name?: string
    last_name?: string
}

interface UsuariosRolResponse {
    rol?: string
    total_usuarios?: number
    usuarios_activos?: number
    usuarios_inactivos?: number
    usuarios?: UsuarioFromBackend[]
}


// ---- Componente principal ----
const ContentPage: React.FC = () => {
    const { changeTitle, showNavbar, showLoader } = useAppContext()

    const [listRolIn, setListRolIn] = useState<InstitutionalRole[]>([])
    const [filteredRoles, setFilteredRoles] = useState<InstitutionalRole[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [showUsersModal, setShowUsersModal] = useState(false)
    const [showAccessLevelModal, setShowAccessLevelModal] = useState(false)
    const [showRolesModal, setShowRolesModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState<InstitutionalRole | null>(null)

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Roles')
        loadRolesData()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        console.log('=== FILTRO DE ROLES ===')
        console.log('Término de búsqueda:', searchTerm)
        console.log('Total de roles:', listRolIn.length)
        
        if (searchTerm.trim() === '') {
            console.log('Sin filtro - mostrando todos los roles')
            setFilteredRoles(listRolIn)
        } else {
            const searchLower = searchTerm.toLowerCase().trim()
            const filtered = listRolIn.filter(role => {
                const nameMatch = (role.name || '').toLowerCase().includes(searchLower)
                const descMatch = (role.description || '').toLowerCase().includes(searchLower)
                const accessMatch = (role.access_level || '').toLowerCase().includes(searchLower)
                
                console.log(`Rol: "${role.name}" - Nombre match: ${nameMatch}, Desc match: ${descMatch}, Access match: ${accessMatch}`)
                
                return nameMatch || descMatch || accessMatch
            })
            console.log('Roles filtrados:', filtered.length)
            console.log('Nombres de roles filtrados:', filtered.map(r => r.name))
            setFilteredRoles(filtered)
        }
    }, [searchTerm, listRolIn])

    const loadRolesData = async () => {
        try {
            showLoader(true)
            const { data, status, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/roles/`
            })
            
            if (status === 'error') {
                console.error('Error al cargar roles:', message)
                showLoader(false)
                Swal.fire({
                    title: 'Error al cargar roles',
                    text: message || 'No se pudieron cargar los roles',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                })
                return false
            }
            
            console.log('Respuesta completa del backend:', data)
            
            // Verificar si la respuesta tiene estructura de paginación o es un array directo
            let rolesFromBackend: RolFromBackend[] = []
            
            if (Array.isArray(data)) {
                // Si es un array directo
                rolesFromBackend = data
            } else if (data && typeof data === 'object' && 'results' in data) {
                // Si tiene estructura de paginación
                const apiResponse = data as RolesApiResponse
                rolesFromBackend = apiResponse.results || []
            } else {
                console.error('Estructura de datos no esperada:', data)
                showLoader(false)
                return false
            }
            
            console.log('Roles extraídos:', rolesFromBackend)

            // Transformar los roles del backend al formato esperado por el frontend
            const rolesTransformed: InstitutionalRole[] = await Promise.all(
                rolesFromBackend.map(async (rol) => {
                    console.log(`Rol: ${rol.nombre}, Permisos:`, rol.permisos)
                    const permisosIds = rol.permisos?.map(p => p.codigo) || []
                    console.log(`Códigos de permisos para ${rol.nombre}:`, permisosIds)
                    
                    // Obtener usuarios asignados a este rol
                    const usuarios = await loadUsuariosByRol(rol.id)
                    
                    return {
                        code: String(rol.id),
                        name: rol.nombre || '',
                        description: rol.descripcion || '',
                        state: rol.is_active ? 'Activo' : 'Inactivo',
                        access_level: 'OPERADOR', // Ajustar según lógica de tu backend
                        access_roles: permisosIds,
                        users_count: usuarios.length,
                        assigned_users: usuarios
                    }
                })
            )
            
            console.log('Roles transformados:', rolesTransformed)
            setListRolIn(rolesTransformed)
            setFilteredRoles(rolesTransformed)
            showLoader(false)
            
        } catch (error) {
            console.error('Error en loadRolesData:', error)
            showLoader(false)
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al cargar los roles',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const loadUsuariosByRol = async (rolId: number): Promise<Array<{ username: string; full_name: string }>> => {
        try {
            console.log(`Cargando usuarios para el rol con ID: ${rolId}`)
            const { data, status, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${rolId}/usuarios/`
            })
            
            if (status === 'error') {
                console.error(`Error al cargar usuarios del rol ${rolId}:`, message)
                return []
            }
            
            console.log(`Respuesta completa de usuarios del rol ${rolId}:`, data)
            
            // La respuesta tiene la estructura: { rol, total_usuarios, usuarios_activos, usuarios_inactivos, usuarios: [...] }
            let usuarios: UsuarioFromBackend[] = []
            
            if (data && typeof data === 'object' && 'usuarios' in data) {
                const responseData = data as UsuariosRolResponse
                usuarios = Array.isArray(responseData.usuarios) ? responseData.usuarios : []
                console.log(`Total de usuarios encontrados para el rol ${rolId}: ${usuarios.length}`)
            } else if (Array.isArray(data)) {
                usuarios = data
            } else if (data && typeof data === 'object' && 'results' in data) {
                usuarios = Array.isArray(data.results) ? data.results : []
            } else {
                console.warn(`Estructura de datos no esperada para usuarios del rol ${rolId}:`, data)
                return []
            }
            
            // Transformar los usuarios al formato esperado
            const usuariosTransformados = usuarios.map((user: UsuarioFromBackend) => ({
                username: user.username || user.email || '',
                full_name: user.full_name || user.nombre || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre'
            }))
            
            console.log(`Usuarios transformados del rol ${rolId}:`, usuariosTransformados)
            return usuariosTransformados
            
        } catch (error) {
            console.error(`Error al cargar usuarios del rol ${rolId}:`, error)
            return []
        }
    }

    const handleToggleState = async (rol: InstitutionalRole) => {
        const action = rol.state === 'Activo' ? 'desactivar' : 'activar'
        const endpoint = rol.state === 'Activo' ? 'deactivate' : 'activate'
        
        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} este rol?`,
            text: `El rol "${rol.name}" será ${rol.state === 'Activo' ? 'desactivado' : 'activado'}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar',
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `${action.charAt(0).toUpperCase() + action.slice(1)}ando rol...`,
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

                const { status, data, message } = await ConsumerAPI({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${rol.code}/${endpoint}/`,
                    method: 'POST'
                })

                if (status === 'error') {
                    // Verificar si es un error de rol del sistema
                    const errorMessage = String((data && typeof data === 'object' && 'error' in data ? data.error : message) || `No se pudo ${action} el rol`)
                    
                    Swal.fire({
                        title: 'No se puede realizar la acción',
                        text: errorMessage,
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#3fad32'
                    })
                    return false
                }

                loadRolesData()

                Swal.fire({
                    title: `Rol ${rol.state === 'Activo' ? 'desactivado' : 'activado'}`,
                    text: `El rol se ha ${rol.state === 'Activo' ? 'desactivado' : 'activado'} correctamente`,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                })
            }
        })
    }

    const handleDelete = async (rol: InstitutionalRole) => {
        // Validar si tiene usuarios asignados
        if (rol.users_count && rol.users_count > 0) {
            const usersList = rol.assigned_users && rol.assigned_users.length > 0
                ? `<ul style="text-align: left; margin-top: 10px;">
                    ${rol.assigned_users.map(user => `<li>${user.full_name} (${user.username})</li>`).join('')}
                </ul>`
                : ''

            Swal.fire({
                title: 'No se puede eliminar',
                html: `Este rol tiene <strong>${rol.users_count}</strong> usuario(s) asignado(s).${usersList}<br><br>Debes reasignar o eliminar estos usuarios antes de eliminar el rol.`,
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: 'var(--text-color-secondary)',
                width: '600px'
            })
            return
        }

        Swal.fire({
            title: '¿Estás seguro de eliminar este rol?',
            text: 'No podrás revertir los cambios',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar',
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Eliminando rol...',
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
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${rol.code}/`,
                    method: 'DELETE'
                })

                if (status === 'error') {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el rol',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    })
                    return false
                }

                loadRolesData()

                Swal.fire({
                    title: 'Rol eliminado',
                    text: 'El rol se ha eliminado correctamente',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                })
            }
        })
    }

    const handleViewUsers = (role: InstitutionalRole) => {
        setSelectedRole(role)
        setShowUsersModal(true)
    }

    const handleViewAccessLevel = (role: InstitutionalRole) => {
        setSelectedRole(role)
        setShowAccessLevelModal(true)
    }

    const handleViewRoles = (role: InstitutionalRole) => {
        setSelectedRole(role)
        setShowRolesModal(true)
    }

    const renderRoleCard = (role: InstitutionalRole) => {
        const hasUsers = role.users_count && role.users_count > 0
        
        return (
            <div key={role.code} className={stylesPage.roleCard}>
                <div className={stylesPage.cardHeader}>
                    <div className={stylesPage.cardTitle}>
                        <h3>{role.name}</h3>
                        <span className={`${stylesPage.badge} ${
                            role.state === 'Activo' ? stylesPage.badgeActive : stylesPage.badgeInactive
                        }`}>
                            {role.state}
                        </span>
                    </div>
                    <div className={stylesPage.cardActions}>
                        <button 
                            className={`${stylesPage.actionBtn} ${role.state === 'Activo' ? stylesPage.actionBtnToggleActive : stylesPage.actionBtnToggleInactive}`}
                            onClick={() => handleToggleState(role)}
                            title={role.state === 'Activo' ? 'Desactivar rol' : 'Activar rol'}
                        >
                            {role.state === 'Activo' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </button>
                        <Link 
                            href={`/gestor_usuarios/roles/${role.code}`}
                            className={stylesPage.actionBtn}
                            title="Editar"
                        >
                            <EditIcon />
                        </Link>
                        <button 
                            className={`${stylesPage.actionBtn} ${hasUsers ? stylesPage.actionBtnDisabled : stylesPage.actionBtnDelete}`}
                            onClick={() => handleDelete(role)}
                            title={hasUsers ? 'No se puede eliminar (tiene usuarios asignados)' : 'Eliminar'}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>

                <div className={stylesPage.cardBody}>
                    <div className={stylesPage.cardInfo}>
                        <div className={stylesPage.infoItemRow}>
                            <div className={stylesPage.infoSection}>
                                <SecurityIcon className={stylesPage.infoIcon} />
                                <div className={stylesPage.infoContent}>
                                    <span className={stylesPage.infoLabel}>Nivel de acceso</span>
                                    <button 
                                        className={stylesPage.viewDetailBtn}
                                        onClick={() => handleViewAccessLevel(role)}
                                    >
                                        <VisibilityIcon />
                                        <span>Ver detalles</span>
                                    </button>
                                </div>
                            </div>

                            <div className={stylesPage.infoSection}>
                                <LockIcon className={stylesPage.infoIcon} />
                                <div className={stylesPage.infoContent}>
                                    <span className={stylesPage.infoLabel}>Permisos ({role.access_roles?.length || 0})</span>
                                    <button 
                                        className={stylesPage.viewDetailBtn}
                                        onClick={() => handleViewRoles(role)}
                                        disabled={!role.access_roles || role.access_roles.length === 0}
                                    >
                                        <VisibilityIcon />
                                        <span>Ver permisos</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={stylesPage.cardFooter}>
                    <div className={stylesPage.usersSection}>
                        <div className={stylesPage.usersSectionHeader}>
                            <GroupIcon />
                            <span className={stylesPage.usersCount}>
                                {role.users_count || 0} usuario(s) asignado(s)
                            </span>
                        </div>
                        
                        {role.users_count && role.users_count > 0 && (
                            <button 
                                className={stylesPage.viewUsersBtn}
                                onClick={() => handleViewUsers(role)}
                            >
                                <VisibilityIcon />
                                <span>Ver usuarios</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={stylesPage.content}>
            <div className={stylesPage.rolesMainContainer}>            
                <div className={stylesPage.header}>
                    <div className={stylesPage.searchContainer}>
                        <div className={stylesPage.searchWrapper}>
                            <SearchIcon className={stylesPage.searchIcon} />
                            <InputText
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, descripción o nivel de acceso..."
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
                    <div className={stylesPage.btnNewRolin}>
                        <Link href="/gestor_usuarios/roles/crear">
                            <AddIcon />
                            <span>Nuevo rol</span>
                        </Link>
                    </div>
                </div>

                <div className={stylesPage.cardsContainer}>
                    {filteredRoles.length > 0 ? (
                        filteredRoles.map(role => renderRoleCard(role))
                    ) : (
                        <div className={stylesPage.emptyState}>
                            <p>No se encontraron roles</p>
                        </div>
                    )}
                </div>

                {/* Modal de Usuarios */}
                <Dialog
                    visible={showUsersModal}
                    onHide={() => setShowUsersModal(false)}
                    className={stylesPage.usersModalNew}
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
                            background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                            flexShrink: 0
                        }}>
                            <GroupIcon style={{ fontSize: '50px', color: '#ffffff' }} />
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
                        }}>Usuarios Asignados</h2>
                        <p style={{
                            fontSize: '17px',
                            color: '#7f8c8d',
                            margin: '0 0 24px 0',
                            padding: 0,
                            fontWeight: 500,
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}>{selectedRole?.name}</p>
                        
                        <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent 0%, #4A90E2 50%, transparent 100%)',
                            margin: '0 auto 24px auto',
                            borderRadius: '4px'
                        }}></div>
                        
                        {selectedRole?.assigned_users && selectedRole.assigned_users.length > 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                maxHeight: '350px',
                                overflowY: 'auto',
                                width: '100%',
                                padding: '0 4px'
                            }}>
                                {selectedRole.assigned_users.map((user, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '18px',
                                        padding: '20px 22px',
                                        background: '#ffffff',
                                        borderRadius: '14px',
                                        border: '2px solid #e3f2fd',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                        transition: 'all 0.25s ease'
                                    }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            minWidth: '50px',
                                            background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 3px 8px rgba(74, 144, 226, 0.2)'
                                        }}>
                                            <PersonIcon style={{ fontSize: '24px', color: '#ffffff' }} />
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                color: '#1a1a1a',
                                                marginBottom: '4px'
                                            }}>{user.full_name}</div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                fontWeight: 500
                                            }}>@{user.username}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '50px 30px',
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                border: '2px dashed #dee2e6'
                            }}>
                                <GroupIcon style={{ fontSize: '64px', opacity: 0.2, color: '#9ca3af' }} />
                                <p style={{
                                    fontSize: '15px',
                                    margin: '20px 0 0 0',
                                    fontWeight: 500,
                                    color: '#6b7280'
                                }}>No hay usuarios asignados a este rol</p>
                            </div>
                        )}
                    </div>
                </Dialog>

                {/* Modal de Nivel de Acceso */}
                <Dialog
                    visible={showAccessLevelModal}
                    onHide={() => setShowAccessLevelModal(false)}
                    className={stylesPage.accessLevelModal}
                    style={{ width: '540px', maxWidth: '90vw' }}
                    breakpoints={{ '960px': '80vw', '640px': '95vw' }}
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
                            background: 'linear-gradient(135deg, #2e7d32 0%, #2c7a4d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                            flexShrink: 0
                        }}>
                            <SecurityIcon style={{ fontSize: '50px', color: '#ffffff' }} />
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
                        }}>Nivel de Acceso</h2>
                        <p style={{
                            fontSize: '17px',
                            color: '#7f8c8d',
                            margin: '0 0 24px 0',
                            padding: 0,
                            fontWeight: 500,
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}>{selectedRole?.name}</p>
                        
                        <div style={{
                            fontSize: '38px',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            margin: '8px 0 16px 0',
                            padding: 0,
                            letterSpacing: '2px',
                            textAlign: 'center',
                            lineHeight: 1.1
                        }}>
                            {selectedRole?.access_level}
                        </div>
                        
                        <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent 0%, #2e7d32 50%, transparent 100%)',
                            margin: '20px auto 24px auto',
                            borderRadius: '4px'
                        }}></div>
                        
                        <div style={{
                            width: '100%',
                            padding: '24px 28px',
                            background: '#f8f9fa',
                            borderRadius: '12px',
                            margin: 0,
                            textAlign: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <p style={{
                                margin: 0,
                                padding: 0,
                                fontSize: '15px',
                                lineHeight: 1.7,
                                color: '#495057',
                                textAlign: 'center'
                            }}>{selectedRole?.description}</p>
                        </div>
                    </div>
                </Dialog>

                {/* Modal de Permisos/Roles */}
                <Dialog
                    visible={showRolesModal}
                    onHide={() => setShowRolesModal(false)}
                    className={stylesPage.rolesModalNew}
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
                        }}>Permisos Asignados</h2>
                        <p style={{
                            fontSize: '17px',
                            color: '#7f8c8d',
                            margin: '0 0 24px 0',
                            padding: 0,
                            fontWeight: 500,
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}>{selectedRole?.name}</p>
                        
                        <div style={{
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent 0%, #FF9800 50%, transparent 100%)',
                            margin: '0 auto 24px auto',
                            borderRadius: '4px'
                        }}></div>
                        
                        {selectedRole?.access_roles && selectedRole.access_roles.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: '12px',
                                maxHeight: '350px',
                                overflowY: 'auto',
                                width: '100%',
                                padding: '0 4px'
                            }}>
                                {selectedRole.access_roles.map((rol, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '16px 18px',
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        border: '2px solid #fff3e0',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                                        transition: 'all 0.25s ease'
                                    }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            minWidth: '42px',
                                            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 6px rgba(255, 152, 0, 0.25)'
                                        }}>
                                            <LockIcon style={{ fontSize: '20px', color: '#ffffff' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#1f2937',
                                                wordBreak: 'break-word'
                                            }}>{rol}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '50px 30px',
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                border: '2px dashed #dee2e6'
                            }}>
                                <LockIcon style={{ fontSize: '64px', opacity: 0.2, color: '#9ca3af' }} />
                                <p style={{
                                    fontSize: '15px',
                                    margin: '20px 0 0 0',
                                    fontWeight: 500,
                                    color: '#6b7280'
                                }}>No hay permisos asignados a este rol</p>
                            </div>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    )
}

export default ContentPage
