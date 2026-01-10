'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import SecurityIcon from '@mui/icons-material/Security'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
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
    id: string
    firstName: string
    lastName: string
    email: string
    username: string
    roleName: string
    roleId?: number
    isActive: boolean
    tipoUsuario: string
}

interface BackendUser {
    id: number
    first_name: string
    last_name: string
    email: string
    username?: string
    is_active?: boolean
    tipo_usuario?: string
    rol_detail?: {
        id?: number
        nombre: string
        nombre_display: string
    }
    roles?: Array<{
        id: number
        nombre: string
    }>
    [key: string]: unknown
}

interface BackendUsersResponse {
    count?: number
    next?: string | null
    previous?: string | null
    results?: BackendUser[]
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
    const { changeTitle, showNavbar, changeUserInfo, appState, showLoader } = useAppContext()
    const { userInfo } = appState

    const [listUsers, setListUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [roleUsers, setRoleUsers] = useState<{[roleId: number]: User[]}>({})

    useEffect(() => {
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

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(listUsers)
        } else {
            const filtered = listUsers.filter(user => 
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.tipoUsuario.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredUsers(filtered)
        }
    }, [searchTerm, listUsers])

    const loadUsers = async () => {
        try {
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

            console.log('Datos recibidos del backend:', data)
            const backendResponse = data as BackendUsersResponse | BackendUser[]
            const usersData = Array.isArray(backendResponse) ? backendResponse : (backendResponse?.results || [])
            console.log('Users data extraído:', usersData)
            
            const adaptedUsers: User[] = Array.isArray(usersData) ? usersData.map((user: BackendUser) => {
                const roleName = user.rol_detail?.nombre || 'Sin rol'
                const roleNameLower = roleName.toLowerCase()
                
                // Determinar tipo de usuario: si no viene del backend, inferir por el rol
                let tipoUsuario = user.tipo_usuario || ''
                
                if (!tipoUsuario) {
                    // Roles internos: superusuario, operador, administrador
                    if (roleNameLower.includes('superusuario') || 
                        roleNameLower.includes('operador') || 
                        roleNameLower.includes('admin')) {
                        tipoUsuario = 'interno'
                    } else {
                        tipoUsuario = 'externo'
                    }
                }
                
                return {
                    id: user.id?.toString() || '',
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    username: user.username || '',
                    roleName: roleName,
                    roleId: user.rol_detail?.id || (user.roles && user.roles.length > 0 ? user.roles[0].id : undefined),
                    isActive: user.is_active ?? true,
                    tipoUsuario: tipoUsuario
                }
            }) : []
            
            console.log('Usuarios adaptados:', adaptedUsers)
            setListUsers(adaptedUsers)
            setFilteredUsers(adaptedUsers)
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

    // Función para cargar usuarios de un rol específico - disponible para uso futuro
    // Puede ser utilizada para mostrar usuarios filtrados por rol
    // Ejemplo de uso: const users = await _loadUsersByRole(1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _loadUsersByRole = async (roleId: number): Promise<User[]> => {
        try {
            // Si ya tenemos los usuarios de este rol en caché, no los volvemos a cargar
            if (roleUsers[roleId]) {
                return roleUsers[roleId]
            }

            const { token } = await GetRoute()
            
            if (!token || token === 'false') {
                console.error('Token no disponible')
                return []
            }

            const { data, status, message } = await consumerPublicAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${roleId}/usuarios/`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (status === 'error') {
                console.error('Error al cargar usuarios del rol:', message)
                return []
            }

            const backendResponse = data as BackendUsersResponse | BackendUser[]
            const usersData = Array.isArray(backendResponse) ? backendResponse : (backendResponse?.results || [])
            
            const adaptedUsers: User[] = usersData.map((user: BackendUser) => {
                const roleName = user.rol_detail?.nombre || 'Sin rol'
                const roleNameLower = roleName.toLowerCase()
                
                let tipoUsuario = user.tipo_usuario || ''
                
                if (!tipoUsuario) {
                    if (roleNameLower.includes('superusuario') || 
                        roleNameLower.includes('operador') || 
                        roleNameLower.includes('admin')) {
                        tipoUsuario = 'interno'
                    } else {
                        tipoUsuario = 'externo'
                    }
                }
                
                return {
                    id: user.id?.toString() || '',
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    username: user.username || '',
                    roleName: roleName,
                    roleId: user.rol_detail?.id,
                    isActive: user.is_active ?? true,
                    tipoUsuario: tipoUsuario
                }
            })

            // Guardar en caché
            setRoleUsers(prev => ({
                ...prev,
                [roleId]: adaptedUsers
            }))

            return adaptedUsers
        } catch (error) {
            console.error('Error al cargar usuarios del rol:', error)
            return []
        }
    }

    const handleDelete = async (user: User) => {
        Swal.fire({
            title: '¿Estás seguro de eliminar este usuario?',
            text: 'No podrás revertir los cambios',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
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
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/`,
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

    const handleToggleActive = async (user: User) => {
        const action = user.isActive ? 'desactivar' : 'activar'
        const endpoint = user.isActive ? 'deactivate' : 'activate'

        Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} este usuario?`,
            text: `El usuario "${user.firstName} ${user.lastName}" será ${user.isActive ? 'desactivado' : 'activado'}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar',
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `${action.charAt(0).toUpperCase() + action.slice(1)}ando usuario...`,
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

                try {
                    const { token } = await GetRoute()

                    if (!token || token === 'false') {
                        Swal.fire({
                            title: 'Error',
                            text: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        })
                        return
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/${endpoint}/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })

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
                        title: `Usuario ${user.isActive ? 'desactivado' : 'activado'}`,
                        text: `El usuario se ha ${user.isActive ? 'desactivado' : 'activado'} correctamente`,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    })
                } catch (error) {
                    console.error(`Error al ${action} usuario:`, error)
                    Swal.fire({
                        title: 'Error',
                        text: `Ocurrió un error al ${action} el usuario`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                }
            }
        })
    }

    const renderUserCard = (user: User) => {
        return (
            <div key={user.id} className={stylesPage.userCard}>
                <div className={stylesPage.cardHeader}>
                    <div className={stylesPage.cardTitle}>
                        <h3>{user.firstName} {user.lastName}</h3>
                        <span className={`${stylesPage.badge} ${
                            user.isActive ? stylesPage.badgeActive : stylesPage.badgeInactive
                        }`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    <div className={stylesPage.cardActions}>
                        <button 
                            className={`${stylesPage.actionBtn} ${user.isActive ? stylesPage.actionBtnToggleActive : stylesPage.actionBtnToggleInactive}`}
                            onClick={() => handleToggleActive(user)}
                            title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                            {user.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </button>
                        <Link 
                            href={`/gestor_usuarios/${user.id}`}
                            className={stylesPage.actionBtn}
                            title="Editar"
                        >
                            <EditIcon />
                        </Link>
                        <button 
                            className={`${stylesPage.actionBtn} ${stylesPage.actionBtnDelete}`}
                            onClick={() => handleDelete(user)}
                            title="Eliminar"
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                </div>

                <div className={stylesPage.cardBody}>
                    <div className={stylesPage.cardInfo}>
                        <div className={stylesPage.infoItem}>
                            <PersonIcon className={stylesPage.infoIcon} />
                            <div className={stylesPage.infoContent}>
                                <span className={stylesPage.infoLabel}>Usuario</span>
                                <span className={stylesPage.infoValue}>@{user.username}</span>
                            </div>
                        </div>

                        <div className={stylesPage.infoItem}>
                            <EmailIcon className={stylesPage.infoIcon} />
                            <div className={stylesPage.infoContent}>
                                <span className={stylesPage.infoLabel}>Correo</span>
                                <span className={stylesPage.infoValue}>{user.email}</span>
                            </div>
                        </div>

                        <div className={stylesPage.infoItem}>
                            <SecurityIcon className={stylesPage.infoIcon} />
                            <div className={stylesPage.infoContent}>
                                <span className={stylesPage.infoLabel}>Rol</span>
                                <span className={stylesPage.infoValue}>{user.roleName}</span>
                            </div>
                        </div>

                        <div className={stylesPage.infoItem}>
                            <PersonIcon className={stylesPage.infoIcon} />
                            <div className={stylesPage.infoContent}>
                                <span className={stylesPage.infoLabel}>Tipo</span>
                                <span className={`${stylesPage.infoValue} ${stylesPage.tipoBadge}`}>
                                    {user.tipoUsuario === 'interno' ? '🏢 Interno' : '🌐 Externo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={stylesPage.content}>
            <div className={stylesPage.usersMainContainer}>            
                <div className={stylesPage.header}>
                    <div className={stylesPage.searchContainer}>
                        <div className={stylesPage.searchWrapper}>
                            <SearchIcon className={stylesPage.searchIcon} />
                            <InputText
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, correo, usuario, rol o tipo..."
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
                    <div className={stylesPage.btnNewUser}>
                        <Link href="/gestor_usuarios/crear">
                            <AddIcon />
                            <span>Nuevo usuario</span>
                        </Link>
                    </div>
                </div>

                <div className={stylesPage.cardsContainer}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => renderUserCard(user))
                    ) : (
                        <div className={stylesPage.emptyState}>
                            <p>No se encontraron usuarios</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageUsersPage