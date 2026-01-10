'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'

import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createUser.module.css'

// ---- Window interface extension ----
declare global {
    interface Window {
        __tempRolId?: number
    }
}

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
}

interface Rol {
    code: string | number
    name: string
}

interface RolFromBackend {
    id: number
    nombre: string
    name?: string
    code?: string | number
}

interface InputsValues {
    [key: string]: unknown
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    telefono: string
    tipo_usuario: string
    roles: Rol[]
    is_active: boolean
    is_staff: boolean
    is_superuser: boolean
    telegram_username: string
    telegram_notifications_enabled: boolean
}

interface ContentPageUpdateProps {
    userUrl: {
        userId: string | number
    }
    infoPage?: InfoPage
}

interface UserData {
    username?: string
    email?: string
    first_name?: string
    last_name?: string
    telefono?: string
    tipo_usuario?: string
    roles?: RolFromBackend[]
    rol?: number
    rol_detail?: RolFromBackend
    is_active?: boolean
    is_staff?: boolean
    is_superuser?: boolean
    telegram_username?: string
    telegram_notifications_enabled?: boolean
}

interface RolesAPIResponse {
    results?: RolFromBackend[]
    [key: string]: unknown
}

// ---- Componente principal ----
const ContentPageUpdate: React.FC<ContentPageUpdateProps> = ({
    userUrl,
    infoPage = {
        title: 'Editar usuario',
        route: `/gestor_usuarios/${userUrl.userId}`
    }
}) => {
    // * context
    const { changeTitle, showNavbar, showLoader, appState } = useAppContext()

    // * hooks
    const router = useRouter()

    // * states
    const [listRols, setListRols] = useState<Rol[]>([])
    const [filteredRols, setFilteredRols] = useState<Rol[]>([])
    const [rolesState, setRolesState] = useState<Record<string, Rol[] | null>>({
        roles: []
    })
    const [inputsValues, setInputsValues] = useState<InputsValues>({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        telefono: '',
        tipo_usuario: 'externo',
        roles: [],
        is_active: true,
        is_staff: false,
        is_superuser: false,
        telegram_username: '',
        telegram_notifications_enabled: false
    })

    // * effects
    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title
        })
        loadRols()
        loadUserInfo()
        // eslint-disable-next-line
    }, [])

    // Efecto para sincronizar rolesState con inputsValues
    useEffect(() => {
        if (rolesState.roles) {
            setInputsValues(prev => ({
                ...prev,
                roles: rolesState.roles || []
            }))
        }
    }, [rolesState])

    // Efecto para filtrar roles según el tipo de usuario y permisos
    useEffect(() => {
        if (listRols.length === 0) return

        const isSuperuser = appState.userInfo?.levelAccessRolSistema === 'ROOT'
        const tipoUsuario = inputsValues.tipo_usuario

        const rolesFiltered = listRols.filter(rol => {
            const roleName = rol.name.toLowerCase()

            // Solo superusuarios pueden asignar rol de superusuario
            if (roleName === 'superusuario' && !isSuperuser) {
                return false
            }

            // Operador solo para usuarios internos
            if (roleName === 'operador' && tipoUsuario !== 'interno') {
                return false
            }

            // Solo lectura solo para usuarios externos
            if (roleName === 'solo_lectura' && tipoUsuario !== 'externo') {
                return false
            }

            return true
        })

        setFilteredRols(rolesFiltered)

        // Limpiar roles seleccionados que ya no son válidos
        const currentSelectedRoles = inputsValues.roles || []
        const validSelectedRoles = currentSelectedRoles.filter(selectedRol => 
            rolesFiltered.some(filteredRol => filteredRol.code === selectedRol.code)
        )

        if (validSelectedRoles.length !== currentSelectedRoles.length) {
            setInputsValues(prev => ({
                ...prev,
                roles: validSelectedRoles
            }))
            setRolesState({
                roles: validSelectedRoles
            })
        }
    }, [listRols, inputsValues.tipo_usuario, appState.userInfo?.levelAccessRolSistema, inputsValues.roles])

    // * methods
    const loadUserInfo = async () => {
        try {
            showLoader(true)
            
            const { status, message, data } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userUrl.userId}/`
            })

            if (status === 'error') {
                console.error('Error del servidor:', message)
                Swal.fire({
                    title: 'Error',
                    text: message || 'No se pudo cargar la información del usuario',
                    icon: 'error'
                })
                showLoader(false)
                return
            }

            // Mapear el rol del usuario (puede venir como 'rol' singular o 'roles' plural)
            const userData = data as UserData
            let rolesFromUser: Rol[] = []
            
            if (userData?.roles && Array.isArray(userData.roles)) {
                // Si viene como array de roles
                rolesFromUser = userData.roles.map((rol: RolFromBackend) => ({
                    code: rol.id || rol.code,
                    name: rol.nombre || rol.name
                }))
            } else if (userData?.rol_detail) {
                // Si viene como rol_detail (un solo rol)
                rolesFromUser = [{
                    code: userData.rol_detail.id,
                    name: userData.rol_detail.nombre
                }]
            } else if (userData?.rol) {
                // Si solo viene el ID del rol, necesitamos buscarlo en la lista de roles
                const rolId = userData.rol
                // Por ahora lo dejamos vacío, se llenará cuando carguen los roles
                rolesFromUser = []
                // Guardar el ID temporalmente para buscarlo después
                window.__tempRolId = rolId
            }

            setInputsValues({
                username: userData?.username || '',
                email: userData?.email || '',
                password: '',
                first_name: userData?.first_name || '',
                last_name: userData?.last_name || '',
                telefono: userData?.telefono || '',
                tipo_usuario: userData?.tipo_usuario || 'externo',
                roles: rolesFromUser,
                is_active: userData?.is_active ?? true,
                is_staff: userData?.is_staff ?? false,
                is_superuser: userData?.is_superuser ?? false,
                telegram_username: userData?.telegram_username || '',
                telegram_notifications_enabled: userData?.telegram_notifications_enabled ?? false
            })

            setRolesState({
                roles: rolesFromUser
            })

            showLoader(false)
        } catch (error) {
            console.error('Error al cargar la información del usuario:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información del usuario',
                icon: 'error'
            })
            showLoader(false)
        }
    }

    const loadRols = async () => {
        try {
            showLoader(true)
            
            const { status, message, data } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/roles/`
            })

            if (status === 'error') {
                console.error('Error del servidor:', message)
                Swal.fire({
                    title: 'Error',
                    text: message || 'No se pudieron cargar los roles disponibles',
                    icon: 'error'
                })
                showLoader(false)
                return
            }
            
            const rolesData = (data as RolesAPIResponse)?.results || data
            
            const rolesFormatted: Rol[] = Array.isArray(rolesData) 
                ? rolesData.map((rol: RolFromBackend) => ({
                    code: rol.id,
                    name: rol.nombre || rol.name
                }))
                : []
            
            setListRols(rolesFormatted)
            
            // Si hay un ID de rol temporal guardado, buscarlo y asignarlo
            const tempRolId = window.__tempRolId
            if (tempRolId && rolesFormatted.length > 0) {
                const rolEncontrado = rolesFormatted.find(r => String(r.code) === String(tempRolId))
                if (rolEncontrado) {
                    setInputsValues(prev => ({
                        ...prev,
                        roles: [rolEncontrado]
                    }))
                    setRolesState({
                        roles: [rolEncontrado]
                    })
                }
                // Limpiar el ID temporal
                delete window.__tempRolId
            }
            
            showLoader(false)
        } catch (error) {
            console.error('Error al cargar los roles:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los roles disponibles',
                icon: 'error'
            })
            showLoader(false)
        }
    }

    const userUpdated = () => {
        Swal.fire({
            title: 'Proceso exitoso',
            text: 'El usuario se ha actualizado correctamente',
            icon: 'success'
        }).then(() => {
            router.push('/gestor_usuarios')
        })
    }

    const userNotUpdated = (message: string) => {
        Swal.fire({
            title: 'Upss...',
            text: message,
            icon: 'error'
        })
    }

    const validateForm = () => {
        const { username, email, first_name, last_name, password } = inputsValues

        if (!username || username.trim() === '') {
            Swal.fire({
                text: 'El nombre de usuario es obligatorio',
                title: 'Error en las validaciones',
                icon: 'warning'
            })
            return false
        }
        if (!email || email.trim() === '') {
            Swal.fire({
                text: 'El correo electrónico es obligatorio',
                title: 'Error en las validaciones',
                icon: 'warning'
            })
            return false
        }
        if (!first_name || first_name.trim() === '') {
            Swal.fire({
                text: 'El nombre es obligatorio',
                title: 'Error en las validaciones',
                icon: 'warning'
            })
            return false
        }
        if (!last_name || last_name.trim() === '') {
            Swal.fire({
                text: 'El apellido es obligatorio',
                title: 'Error en las validaciones',
                icon: 'warning'
            })
            return false
        }
        if (password && password.length < 8) {
            Swal.fire({
                text: 'La contraseña debe tener al menos 8 caracteres',
                title: 'Error en las validaciones',
                icon: 'warning'
            })
            return false
        }
        return true
    }

    const prepareDataAndSubmit = async ({ url, inputsValues }: { url: string; inputsValues: Record<string, unknown> }) => {
        const dataToSend: Record<string, unknown> = {
            username: inputsValues.username,
            email: inputsValues.email,
            first_name: inputsValues.first_name,
            last_name: inputsValues.last_name,
            is_active: inputsValues.is_active,
            is_staff: inputsValues.is_staff,
            is_superuser: inputsValues.is_superuser,
            tipo_usuario: inputsValues.tipo_usuario,
            telegram_notifications_enabled: inputsValues.telegram_notifications_enabled
        }

        // Agregar campos opcionales solo si tienen valor
        if (inputsValues.password && (inputsValues.password as string).trim() !== '') {
            dataToSend.password = inputsValues.password
        }
        if (inputsValues.telefono && (inputsValues.telefono as string).trim() !== '') {
            dataToSend.telefono = inputsValues.telefono
        }
        
        // Agregar rol seleccionado (el backend espera un solo rol, no un array)
        if (inputsValues.roles && Array.isArray(inputsValues.roles) && inputsValues.roles.length > 0) {
            // Tomar solo el primer rol seleccionado
            dataToSend.rol = inputsValues.roles[0].code
        }
        
        if (inputsValues.telegram_username && (inputsValues.telegram_username as string).trim() !== '') {
            dataToSend.telegram_username = inputsValues.telegram_username
        }

        Swal.fire({
            title: 'Actualizando...',
            text: 'Espere un momento por favor',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        try {
            const { token } = await GetRoute()

            if (!token || token === 'false' || token.trim() === '') {
                Swal.close()
                userNotUpdated('Token inválido o expirado')
                return
            }

            const request = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            })

            const jsonResponse = await request.json()

            Swal.close()

            if (!request.ok) {
                const errorMessage = jsonResponse.detail || jsonResponse.message || 'Error al actualizar el usuario'
                userNotUpdated(errorMessage)
                return
            }

            if (jsonResponse.status === 'error') {
                userNotUpdated(jsonResponse.message || 'Error al actualizar el usuario')
                return
            }

            userUpdated()
        } catch (error) {
            Swal.close()
            console.error('Error en la solicitud:', error)
            userNotUpdated('Error al realizar la solicitud')
        }
    }

    // * renders
    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Editar usuario</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Modifique la información del usuario como nombre, contraseña, roles, etc.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Campos básicos obligatorios */}
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.formLabel}>
                            Nombre de usuario*
                            <span className={styles.labelSubtext}>Usuario único en el sistema</span>
                        </label>
                        <input
                            type="text"
                            id="username"
                            required
                            className={styles.formInput}
                            value={inputsValues.username}
                            onChange={(e) => setInputsValues({ ...inputsValues, username: e.target.value })}
                            placeholder="johndoe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            Correo electrónico*
                            <span className={styles.labelSubtext}>Correo electrónico de contacto (Login)</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            className={styles.formInput}
                            value={inputsValues.email}
                            onChange={(e) => setInputsValues({ ...inputsValues, email: e.target.value })}
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="first_name" className={styles.formLabel}>
                            Nombre*
                            <span className={styles.labelSubtext}>Nombre del usuario</span>
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            required
                            className={styles.formInput}
                            value={inputsValues.first_name}
                            onChange={(e) => setInputsValues({ ...inputsValues, first_name: e.target.value })}
                            placeholder="John"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="last_name" className={styles.formLabel}>
                            Apellido*
                            <span className={styles.labelSubtext}>Apellido del usuario</span>
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            required
                            className={styles.formInput}
                            value={inputsValues.last_name}
                            onChange={(e) => setInputsValues({ ...inputsValues, last_name: e.target.value })}
                            placeholder="Doe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.formLabel}>
                            Contraseña
                            <span className={styles.labelSubtext}>Dejar vacío para mantener la actual</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={styles.formInput}
                            value={inputsValues.password}
                            onChange={(e) => setInputsValues({ ...inputsValues, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="telefono" className={styles.formLabel}>
                            Número de teléfono
                            <span className={styles.labelSubtext}>Teléfono de contacto</span>
                        </label>
                        <input
                            type="tel"
                            id="telefono"
                            className={styles.formInput}
                            value={inputsValues.telefono}
                            onChange={(e) => setInputsValues({ ...inputsValues, telefono: e.target.value })}
                            placeholder="3211234567"
                        />
                    </div>

                    {/* Separador - Configuración de usuario */}
                    <div className={styles.sectionDivider}>
                        <h3 className={styles.sectionSubtitle}>Configuración de usuario</h3>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="tipo_usuario" className={styles.formLabel}>
                            Tipo de usuario
                            <span className={styles.labelSubtext}>Interno o externo</span>
                        </label>
                        <select
                            id="tipo_usuario"
                            className={styles.formSelect}
                            value={inputsValues.tipo_usuario}
                            onChange={(e) => setInputsValues({ ...inputsValues, tipo_usuario: e.target.value })}
                        >
                            <option value="externo">Externo</option>
                            <option value="interno">Interno</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="roles" className={styles.formLabel}>
                            Rol*
                            <span className={styles.labelSubtext}>Selecciona un rol para el usuario</span>
                        </label>
                        <select
                            id="roles"
                            className={styles.formSelect}
                            value={inputsValues.roles && inputsValues.roles.length > 0 ? inputsValues.roles[0].code : ''}
                            onChange={(e) => {
                                const selectedCode = e.target.value
                                const selectedRol = filteredRols.find(r => String(r.code) === String(selectedCode))
                                if (selectedRol) {
                                    setInputsValues(prev => ({
                                        ...prev,
                                        roles: [selectedRol]
                                    }))
                                    setRolesState({
                                        roles: [selectedRol]
                                    })
                                } else {
                                    setInputsValues(prev => ({
                                        ...prev,
                                        roles: []
                                    }))
                                    setRolesState({
                                        roles: []
                                    })
                                }
                            }}
                            required
                        >
                            <option value="">Seleccione un rol</option>
                            {filteredRols.map((rol) => (
                                <option key={rol.code} value={rol.code}>
                                    {rol.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Estado del usuario
                            <span className={styles.labelSubtext}>Permisos y accesos</span>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    className={styles.checkboxInput}
                                    checked={inputsValues.is_active}
                                    onChange={(e) => setInputsValues({ ...inputsValues, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className={styles.checkboxLabel}>
                                    Usuario activo
                                </label>
                            </div>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id="is_staff"
                                    className={styles.checkboxInput}
                                    checked={inputsValues.is_staff}
                                    onChange={(e) => setInputsValues({ ...inputsValues, is_staff: e.target.checked })}
                                />
                                <label htmlFor="is_staff" className={styles.checkboxLabel}>
                                    Acceso al panel de administración
                                </label>
                            </div>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    type="checkbox"
                                    id="is_superuser"
                                    className={styles.checkboxInput}
                                    checked={inputsValues.is_superuser}
                                    onChange={(e) => setInputsValues({ ...inputsValues, is_superuser: e.target.checked })}
                                />
                                <label htmlFor="is_superuser" className={styles.checkboxLabel}>
                                    Superusuario (todos los permisos)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Separador - Notificaciones Telegram */}
                    <div className={styles.sectionDivider}>
                        <h3 className={styles.sectionSubtitle}>Notificaciones Telegram</h3>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="telegram_username" className={styles.formLabel}>
                            Usuario de Telegram
                            <span className={styles.labelSubtext}>@usuario de Telegram</span>
                        </label>
                        <input
                            type="text"
                            id="telegram_username"
                            className={styles.formInput}
                            value={inputsValues.telegram_username}
                            onChange={(e) => setInputsValues({ ...inputsValues, telegram_username: e.target.value })}
                            placeholder="@johndoe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Notificaciones
                            <span className={styles.labelSubtext}>Configurar notificaciones</span>
                        </label>
                        <div className={styles.checkboxWrapper}>
                            <input
                                type="checkbox"
                                id="telegram_notifications_enabled"
                                className={styles.checkboxInput}
                                checked={inputsValues.telegram_notifications_enabled}
                                onChange={(e) => setInputsValues({ ...inputsValues, telegram_notifications_enabled: e.target.checked })}
                            />
                            <label htmlFor="telegram_notifications_enabled" className={styles.checkboxLabel}>
                                Habilitar notificaciones Telegram
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            Actualizar usuario
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview del usuario */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            {getInitials(inputsValues.first_name, inputsValues.last_name)}
                        </div>
                    </div>
                    <div className={styles.roleBadge}>
                        {inputsValues.is_superuser ? 'SUPERUSUARIO' : inputsValues.is_staff ? 'ADMINISTRADOR' : 'USUARIO'}
                    </div>
                </div>

                <div className={styles.previewInfo}>
                    <h3 className={styles.previewName}>
                        {inputsValues.first_name || inputsValues.last_name 
                            ? `${inputsValues.first_name} ${inputsValues.last_name}`.trim() 
                            : 'Usuario'}
                    </h3>

                    <div className={styles.previewDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Correo electrónico:</span>
                            <span className={styles.detailValue}>
                                {inputsValues.email || 'No especificado'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Username:</span>
                            <span className={styles.detailValue}>
                                {inputsValues.username || 'No especificado'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Teléfono:</span>
                            <span className={styles.detailValue}>
                                {inputsValues.telefono || 'No especificado'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Tipo de usuario:</span>
                            <span className={styles.detailValue}>
                                {inputsValues.tipo_usuario === 'interno' ? 'Interno' : 'Externo'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Roles:</span>
                            <span className={styles.detailValue}>
                                {inputsValues.roles && inputsValues.roles.length > 0 
                                    ? inputsValues.roles.map(rol => rol.name).join(', ')
                                    : 'Sin roles asignados'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Estado:</span>
                            <span className={styles.detailValue}>
                                {inputsValues.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        {inputsValues.telegram_username && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Telegram:</span>
                                <span className={styles.detailValue}>
                                    {inputsValues.telegram_username}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.previewActions}>
                        <button className={styles.actionButton} title="Notificaciones" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                            </svg>
                        </button>
                        <button className={styles.actionButton} title="Mensaje" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </button>
                        <button className={styles.actionButton} title="Comentar" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                            </svg>
                        </button>
                        <button className={styles.actionButton} title="Editar" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    function getInitials(firstName: string, lastName: string): string {
        const first = firstName?.charAt(0)?.toUpperCase() || ''
        const last = lastName?.charAt(0)?.toUpperCase() || ''
        return first && last ? `${first}${last}` : first || last || '?'
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        await prepareDataAndSubmit({
            url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userUrl.userId}/`,
            inputsValues
        })
    }
}

export default ContentPageUpdate