'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'
import LockIcon from '@mui/icons-material/Lock'
import SecurityIcon from '@mui/icons-material/Security'
import Swal from 'sweetalert2'

import GetRoute from '@/components/protectedRoute/getRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import InputMultiSelectCustom from '@/components/shared/inputForm/MultiSelect/multiSelect'
import { useAppContext } from '@/context/appContext'

import styles from './contentPage.module.css'

// ---- Interfaces ----
interface Rol {
    code: string
    name: string
}

interface InputValues {
    nameRol: string
    rolState: string
    rolDescription: string
    rolesAccess: Rol[]
    rolLevelAccess: string
}

interface RolFromAPI {
    id: string | number
    nombre?: string
    name?: string
}

interface RolesAPIResponse {
    count?: number
    next?: string | null
    previous?: string | null
    results?: RolFromAPI[]
}

// ---- Componente principal ----
const ContentPage: React.FC = () => {
    const { changeTitle, showNavbar, showLoader } = useAppContext()
    const router = useRouter()

    const [rolsList, setRolsList] = useState<Rol[]>([])
    const [rolesState, setRolesState] = useState<Record<string, Rol[] | null>>({
        rolesAccess: []
    })
    const [inputValues, setInputValues] = useState<InputValues>({
        nameRol: '',
        rolState: 'Activo',
        rolDescription: '',
        rolesAccess: [],
        rolLevelAccess: ''
    })

    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle('Roles Institucionales - Crear')
        loadRoles()
        // eslint-disable-next-line
    }, [])

    // Efecto para sincronizar rolesState con inputValues
    useEffect(() => {
        if (rolesState.rolesAccess) {
            setInputValues(prev => ({
                ...prev,
                rolesAccess: rolesState.rolesAccess || []
            }))
        }
    }, [rolesState])

    const loadRoles = async () => {
        try {
            showLoader(true)
            
            const { data, status, message } = await ConsumerAPI({
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
            
            // La respuesta tiene estructura de paginación: { count, next, previous, results }
            const apiResponse = data as RolesAPIResponse | RolFromAPI[]
            const rolesData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.results || [])
            
            // Transformar los roles al formato esperado por el multiselect
            const rolesFormatted: Rol[] = Array.isArray(rolesData) 
                ? rolesData.map((rol: RolFromAPI) => ({
                    code: String(rol.id),
                    name: rol.nombre || rol.name || ''
                }))
                : []
            
            console.log('Roles cargados:', rolesFormatted)
            setRolsList(rolesFormatted)
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

    const onSuccessResponse = () => {
        Swal.fire({
            icon: 'success',
            title: 'Proceso exitoso',
            text: 'Se ha creado el rol',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        }).then(() => {
            router.push('/gestor_usuarios/roles')
        })
    }

    const onErrorResponse = (message: string) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message || 'Ha ocurrido un error, intenta nuevamente',
            confirmButtonText: 'Aceptar'
        })
    }

    const validateForm = () => {
        if (!inputValues.nameRol || inputValues.nameRol.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'El nombre del rol es obligatorio',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (!inputValues.rolesAccess || inputValues.rolesAccess.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'Debe seleccionar al menos un permiso',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (!inputValues.rolState) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'El estado es obligatorio',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (!inputValues.rolDescription || inputValues.rolDescription.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'La descripción es obligatoria',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (inputValues.rolDescription.length < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'La descripción debe tener al menos 10 caracteres',
                confirmButtonText: 'Aceptar'
            })
            return false
        }

        if (!inputValues.rolLevelAccess) {
            Swal.fire({
                icon: 'warning',
                title: 'Error en las validaciones',
                text: 'El nivel de acceso es obligatorio',
                confirmButtonText: 'Aceptar'
            })
            return false
        }
        
        return true
    }

    const prepareDataAndSubmit = async () => {
        // Preparar los datos
        const dataToSend = {
            nameRol: inputValues.nameRol,
            rolState: inputValues.rolState,
            rolDescription: inputValues.rolDescription,
            rolesAccess: inputValues.rolesAccess.map(rol => rol.code),
            rolLevelAccess: inputValues.rolLevelAccess
        }

        // Mostrar loader
        Swal.fire({
            title: 'Cargando...',
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
                onErrorResponse('Token inválido o expirado')
                return
            }

            const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/crear_rol_institucional`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            })

            const jsonResponse = await request.json()

            Swal.close()

            // Verificar si hubo error HTTP
            if (!request.ok) {
                const errorMessage = jsonResponse.detail || jsonResponse.message || 'Error al crear el rol'
                onErrorResponse(errorMessage)
                return
            }

            // Verificar si el backend devuelve status de error en el JSON
            if (jsonResponse.status === 'error') {
                onErrorResponse(jsonResponse.message || 'Error al crear el rol')
                return
            }

            onSuccessResponse()
        } catch (error) {
            Swal.close()
            console.error('Error en la solicitud:', error)
            onErrorResponse('Error al realizar la solicitud')
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        await prepareDataAndSubmit()
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Crear nuevo rol institucional</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Configure los permisos, nivel de acceso y demás información del rol.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Nombre del rol */}
                    <div className={styles.formGroup}>
                        <label htmlFor="nameRol" className={styles.formLabel}>
                            Nombre del rol*
                            <span className={styles.labelSubtext}>Nombre descriptivo del rol</span>
                        </label>
                        <input
                            type="text"
                            id="nameRol"
                            required
                            className={styles.formInput}
                            value={inputValues.nameRol}
                            onChange={(e) => setInputValues({ ...inputValues, nameRol: e.target.value })}
                            placeholder="Ej: Administrador de Sistema"
                        />
                    </div>

                    {/* Descripción */}
                    <div className={styles.formGroup}>
                        <label htmlFor="rolDescription" className={styles.formLabel}>
                            Descripción*
                            <span className={styles.labelSubtext}>Descripción detallada del rol</span>
                        </label>
                        <textarea
                            id="rolDescription"
                            required
                            className={styles.formTextarea}
                            value={inputValues.rolDescription}
                            onChange={(e) => setInputValues({ ...inputValues, rolDescription: e.target.value })}
                            placeholder="Describe las responsabilidades y alcance de este rol..."
                            rows={4}
                        />
                    </div>

                    {/* Nivel de acceso */}
                    <div className={styles.formGroup}>
                        <label htmlFor="rolLevelAccess" className={styles.formLabel}>
                            Nivel de acceso*
                            <span className={styles.labelSubtext}>Nivel jerárquico del rol</span>
                        </label>
                        <select
                            id="rolLevelAccess"
                            required
                            className={styles.formSelect}
                            value={inputValues.rolLevelAccess}
                            onChange={(e) => setInputValues({ ...inputValues, rolLevelAccess: e.target.value })}
                        >
                            <option value="">Seleccione un nivel</option>
                            <option value="ROOT">ROOT</option>
                            <option value="SUPERVISOR">SUPERVISOR</option>
                            <option value="OPERADOR">OPERADOR</option>
                            <option value="TECNICO">TECNICO</option>
                        </select>
                    </div>

                    {/* Permisos asignados */}
                    <div className={styles.formGroup}>
                        <label htmlFor="rolesAccess" className={styles.formLabel}>
                            Permisos*
                            <span className={styles.labelSubtext}>Permisos asignados al rol</span>
                        </label>
                        <div className={styles.formInputWrapper}>
                            <InputMultiSelectCustom
                                data={rolsList}
                                onChange={(value) => setRolesState({ ...rolesState, rolesAccess: value })}
                                optionLabel="name"
                                placeholder="Seleccione permisos"
                                maxSelectedLabels={3}
                                filter
                                filterPlaceholder="Buscar permisos..."
                                emptyFilterMessage="No se encontraron permisos"
                                className={styles.multiselect}
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <div className={styles.formGroup}>
                        <label htmlFor="rolState" className={styles.formLabel}>
                            Estado*
                            <span className={styles.labelSubtext}>Estado actual del rol</span>
                        </label>
                        <select
                            id="rolState"
                            required
                            className={styles.formSelect}
                            value={inputValues.rolState}
                            onChange={(e) => setInputValues({ ...inputValues, rolState: e.target.value })}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            Crear rol institucional
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview del rol */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <SecurityIcon style={{ fontSize: '3rem', color: 'white' }} />
                        </div>
                    </div>
                    <div className={styles.roleBadge}>
                        ROL INSTITUCIONAL
                    </div>
                </div>

                <div className={styles.previewInfo}>
                    <h3 className={styles.previewName}>
                        {inputValues.nameRol || 'Nuevo Rol'}
                    </h3>

                    <div className={styles.previewDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Descripción:</span>
                            <span className={styles.detailValue}>
                                {inputValues.rolDescription || 'No especificada'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Nivel de acceso:</span>
                            <span className={styles.detailValue}>
                                {inputValues.rolLevelAccess || 'No especificado'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Permisos:</span>
                            <span className={styles.detailValue}>
                                {inputValues.rolesAccess && inputValues.rolesAccess.length > 0 
                                    ? `${inputValues.rolesAccess.length} permiso(s) asignado(s)`
                                    : 'Sin permisos asignados'}
                            </span>
                        </div>
                        {inputValues.rolesAccess && inputValues.rolesAccess.length > 0 && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Lista de permisos:</span>
                                <div className={styles.permissionsList}>
                                    {inputValues.rolesAccess.map((rol, index) => (
                                        <span key={index} className={styles.permissionBadge}>
                                            <LockIcon style={{ fontSize: '14px' }} />
                                            {rol.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Estado:</span>
                            <span className={styles.detailValue}>
                                {inputValues.rolState === 'Activo' ? (
                                    <span className={styles.statusActive}>
                                        <CheckCircleIcon style={{ fontSize: '16px' }} />
                                        Activo
                                    </span>
                                ) : (
                                    <span className={styles.statusInactive}>
                                        <CancelIcon style={{ fontSize: '16px' }} />
                                        Inactivo
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className={styles.previewActions}>
                        <button className={styles.actionButton} title="Información" type="button">
                            <InfoIcon />
                        </button>
                        <button className={styles.actionButton} title="Seguridad" type="button">
                            <SecurityIcon />
                        </button>
                        <button className={styles.actionButton} title="Permisos" type="button">
                            <LockIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContentPage
