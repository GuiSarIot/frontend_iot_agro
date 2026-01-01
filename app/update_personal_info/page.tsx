'use client'

import { useState, useEffect, useContext, useCallback } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import ConsumerAPIFormData from '@/components/shared/consumerAPI/consumerAPIFormData'
import AppContext from '@/context/appContext'

import styles from './styles.module.css'

// Tipos para props
interface InfoPage {
    title: string
    route: string
}

interface ContentPageUpdateProps {
    infoPage?: InfoPage
}

// Tipos para los formularios
interface _InputsValues {
    [key: string]: unknown
    tipoDocumento: string
    numeroDocumento: number
    nombres: string
    apellidos: string
    numeroTelefono: string
    correoElectronico: string
    correoElectronicoCorporativo: string
    skype: string
    tipoVinculacion: string
    profesion: string
    nombreUsuario: string
    password: string
    passwordConfirm: string
    profilePicture: Record<string, string>
}

interface RolDetail {
    id: number
    nombre: string
    descripcion: string
    permisos: Array<{
        id: number
        nombre: string
        codigo: string
        descripcion: string
        created_at: string
    }>
    created_at: string
    updated_at: string
}

interface UserInfoForm {
    id?: number
    username?: string
    email?: string
    first_name?: string
    last_name?: string
    full_name?: string
    telefono?: string | null
    tipo_usuario?: string
    tipo_usuario_display?: string
    is_active?: boolean
    is_staff?: boolean
    is_superuser?: boolean
    rol?: number
    rol_detail?: RolDetail
    created_at?: string
    updated_at?: string
    last_login?: string | null
    telegram_chat_id?: string | null
    telegram_username?: string | null
    telegram_notifications_enabled?: boolean
    telegram_verified?: boolean
    can_receive_telegram?: boolean | null
}

const ContentPageUpdate: React.FC<ContentPageUpdateProps> = ({
    infoPage: _infoPage = { title: 'Listado de usuarios', route: '/gestor_usuarios' }
}) => {
    //* context
    const { changeTitle, appState, showLoader } = useContext(AppContext.Context)
    const { userInfo: _userInfo } = appState

    //* hooks
    const _router = useRouter()

    //* states
    const [activeTab, setActiveTab] = useState<string>('personal-info')
    const [userInfoForm, setUserInfoForm] = useState<UserInfoForm>({})
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        telefono: '',
        email: ''
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState<string>('')

    //* methods
    const loadInfoUser = useCallback(async () => {
        // Usar el endpoint /me/ que funciona correctamente con autenticación
        const { status, message: _message, data } = await ConsumerAPI({ 
            url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/` 
        })

        if (status === 'error') {
            showLoader(false)
            return false
        }

        if (data && typeof data === 'object') {
            setUserInfoForm(data as UserInfoForm)
            // Inicializar formData con los datos del usuario
            setFormData({
                full_name: (data as UserInfoForm).full_name || `${(data as UserInfoForm).first_name || ''} ${(data as UserInfoForm).last_name || ''}`.trim(),
                username: (data as UserInfoForm).username || '',
                telefono: (data as UserInfoForm).telefono || '',
                email: (data as UserInfoForm).email || ''
            })
        }
        showLoader(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //* effects
    useEffect(() => {
        showLoader(true)
        changeTitle('Usuario')
        SaveRoute({
            routeInfo: '/update_personal_info',
            title: 'Información personal'
        })
        loadInfoUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getInitials = (firstName?: string, lastName?: string): string => {
        const firstInitial = firstName?.charAt(0).toUpperCase() || ''
        const lastInitial = lastName?.charAt(0).toUpperCase() || ''
        return `${firstInitial}${lastInitial}`
    }

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!userInfoForm.id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener el ID del usuario'
            })
            return
        }

        showLoader(true)

        try {
            // Preparar datos para enviar
            const [firstName, ...lastNameParts] = formData.full_name.split(' ')
            const lastName = lastNameParts.join(' ')

            const updateData = {
                username: formData.username,
                email: formData.email,
                first_name: firstName,
                last_name: lastName,
                telefono: formData.telefono
            }

            // Actualizar información del usuario con PATCH
            const { status, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userInfoForm.id}/`,
                method: 'PATCH',
                body: updateData
            })

            if (status === 'error') {
                showLoader(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: message || 'No se pudo actualizar la información'
                })
                return
            }

            // Si hay imagen seleccionada, subirla
            if (selectedFile) {
                const formDataImage = new FormData()
                formDataImage.append('profile_picture', selectedFile)

                await ConsumerAPIFormData({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userInfoForm.id}/`,
                    method: 'PATCH',
                    body: formDataImage,
                    headers: {} // Dejar que el navegador establezca el Content-Type para FormData
                })
            }

            showLoader(false)
            
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Perfil actualizado correctamente',
                confirmButtonColor: '#00a86b'
            })

            // Recargar información del usuario
            loadInfoUser()
        } catch {
            showLoader(false)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar el perfil'
            })
        }
    }

    const tabs = [
        { id: 'personal-info', label: 'Información Personal', icon: '👤' },
        { id: 'update-profile', label: 'Actualizar Perfil', icon: '👥' },
        { id: 'notifications', label: 'Notificaciones', icon: '⚠️' },
        { id: 'security', label: 'Seguridad', icon: '🔒' },
        { id: 'payment', label: 'Payment', icon: '💳' }
    ]

    //* renders
    return (
        <div className={styles.profileContainer}>
            {/* Header */}
            <div className={styles.profileHeader}>
                <h1 className={styles.profileTitle}>
                    Usuario | <span>{userInfoForm.full_name || `${userInfoForm.first_name || ''} ${userInfoForm.last_name || ''}`.trim() || 'Cargando...'}</span>
                </h1>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {activeTab === 'personal-info' && (
                <div className={styles.contentLayout}>
                    {/* Panel izquierdo - Información */}
                    <div className={styles.infoPanel}>
                        <div className={styles.infoSection}>
                            <h2 className={styles.sectionTitle}>Información Personal</h2>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Información basica del usuario
                            </p>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Estado:</span>
                                    <span className={`${styles.statusBadge} ${userInfoForm.is_active ? styles.active : ''}`}>
                                        {userInfoForm.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Nombre Completo:</span>
                                    <span className={styles.fieldValue}>
                                        {userInfoForm.full_name || 'N/A'}
                                    </span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Nombre de usuario:</span>
                                    <span className={styles.fieldValue}>{userInfoForm.username || 'N/A'}</span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Correo electrónico:</span>
                                    <span className={styles.fieldValue}>{userInfoForm.email || 'N/A'}</span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Telefono:</span>
                                    <span className={styles.fieldValue}>{userInfoForm.telefono || 'N/A'}</span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Última conexión:</span>
                                    <span className={styles.fieldValue}>
                                        {userInfoForm.last_login ? formatDate(userInfoForm.last_login) : 'Nunca'}
                                    </span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Telegram username:</span>
                                    <span className={styles.fieldValue}>{userInfoForm.telegram_username || 'N/A'}</span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Registrado:</span>
                                    <span className={styles.fieldValue}>
                                        {formatDate(userInfoForm.created_at)}
                                    </span>
                                </div>

                                <div className={styles.infoField}>
                                    <span className={styles.fieldLabel}>Tipo de usuario:</span>
                                    <span className={styles.fieldValue}>
                                        {userInfoForm.tipo_usuario_display || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel derecho - Card de perfil */}
                    <div className={styles.profileCard}>
                        <div className={styles.profileCardHeader}>
                            <div className={styles.avatarContainer}>
                                <div className={styles.avatar}>
                                    {getInitials(userInfoForm.first_name, userInfoForm.last_name)}
                                </div>
                                <button className={styles.addButton}>+</button>
                            </div>

                            <div className={styles.roleBadge}>
                                {userInfoForm.rol_detail?.nombre?.toUpperCase() || 'SIN ROL'}
                            </div>
                        </div>

                        <div className={styles.profileCardInfo}>
                            <h3 className={styles.profileName}>
                                {userInfoForm.full_name || `${userInfoForm.first_name || ''} ${userInfoForm.last_name || ''}`.trim() || 'Sin nombre'}
                            </h3>

                            <div className={styles.profileDetails}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailValue}>{userInfoForm.email || 'Sin email'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Username:</span>
                                    <span className={styles.detailValue}>{userInfoForm.username || 'N/A'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Última conexión:</span>
                                    <span className={styles.detailValue}>
                                        {userInfoForm.last_login ? formatDate(userInfoForm.last_login) : 'Nunca'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.profileActions}>
                                <button className={styles.actionButton} title="Desactivar notificaciones">
                                    🔕
                                </button>
                                <button className={styles.actionButton} title="Enviar mensaje">
                                    ✉️
                                </button>
                                <button className={styles.actionButton} title="Descargar información">
                                    ☁️
                                </button>
                                <button className={styles.actionButton} title="Guardar">
                                    🔖
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Otros tabs */}
            {activeTab === 'update-profile' && (
                <div className={styles.contentLayout}>
                    {/* Panel izquierdo - Formulario */}
                    <div className={styles.infoPanel}>
                        <div className={styles.infoSection}>
                            <h2 className={styles.sectionTitle}>Actualiza tú perfil</h2>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Edita los datos, como correo, teléfono, nombre, etc.
                            </p>

                            <form className={styles.updateForm} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="full_name" className={styles.formLabel}>
                                        Nombre completo
                                        <span className={styles.labelSubtext}>Su nombre y apellidos</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        className={styles.formInput}
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        placeholder="Guillermo Sarmiento"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="username" className={styles.formLabel}>
                                        Nombre de usuario (MQTT)
                                        <span className={styles.labelSubtext}>Usuario para la conexión MQTT</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        className={styles.formInput}
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Memo"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="telefono" className={styles.formLabel}>
                                        Teléfono
                                        <span className={styles.labelSubtext}>Teléfono de contacto</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        className={styles.formInput}
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="3211234567"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.formLabel}>
                                        Correo electrónico
                                        <span className={styles.labelSubtext}>Correo electrónico de contacto (Login)</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className={styles.formInput}
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="guillonix@gmail.com"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Imágen de perfil actual
                                        <span className={styles.labelSubtext}>Imágen de perfil actual</span>
                                    </label>
                                    
                                    <div className={styles.imagePreviewContainer}>
                                        <div className={styles.imagePreview}>
                                            {previewImage ? (
                                                <Image src={previewImage} alt="Preview" className={styles.previewImg} width={200} height={200} />
                                            ) : (
                                                <div className={styles.placeholderImage}>
                                                    👤
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.imageUploadSection}>
                                            <label className={styles.formLabel}>
                                                Nueva imágen
                                            </label>
                                            <div className={styles.fileInputWrapper}>
                                                <input
                                                    type="text"
                                                    className={styles.formInput}
                                                    placeholder={selectedFile?.name || 'Selecciona una imagen'}
                                                    readOnly
                                                />
                                                <label htmlFor="fileInput" className={styles.browseButton}>
                                                    Browse
                                                </label>
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.submitButton}>
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Panel derecho - Card de perfil */}
                    <div className={`${styles.profileCard} ${styles.profileCardCompact}`}>
                        <div className={styles.profileCardHeader}>
                            <div className={styles.avatarContainer}>
                                <div className={styles.avatar}>
                                    {getInitials(userInfoForm.first_name, userInfoForm.last_name)}
                                </div>
                            </div>

                            <div className={styles.roleBadge}>
                                {userInfoForm.rol_detail?.nombre?.toUpperCase() || 'ADMINISTRADOR'}
                            </div>
                        </div>

                        <div className={styles.profileCardInfo}>
                            <h3 className={styles.profileName}>
                                {userInfoForm.full_name || `${userInfoForm.first_name || ''} ${userInfoForm.last_name || ''}`.trim() || 'Sin nombre'}
                            </h3>

                            <div className={styles.profileDetails}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailValue}>{userInfoForm.email || 'guillonix@gmail.com'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Username:</span>
                                    <span className={styles.detailValue}>{userInfoForm.username || 'Memo'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Última conexión:</span>
                                    <span className={styles.detailValue}>
                                        {userInfoForm.last_login ? formatDate(userInfoForm.last_login) : '2026-01-01 11:36:56'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.profileActions}>
                                <button className={styles.actionButton} title="Desactivar notificaciones">
                                    🔕
                                </button>
                                <button className={styles.actionButton} title="Enviar mensaje">
                                    ✉️
                                </button>
                                <button className={styles.actionButton} title="Descargar información">
                                    ☁️
                                </button>
                                <button className={styles.actionButton} title="Guardar">
                                    🔖
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className={styles.infoPanel}>
                    <h2 className={styles.sectionTitle}>Notificaciones</h2>
                    <p>Configuración de notificaciones próximamente...</p>
                </div>
            )}

            {activeTab === 'security' && (
                <div className={styles.infoPanel}>
                    <h2 className={styles.sectionTitle}>Seguridad</h2>
                    <p>Configuración de seguridad próximamente...</p>
                </div>
            )}

            {activeTab === 'payment' && (
                <div className={styles.infoPanel}>
                    <h2 className={styles.sectionTitle}>Payment</h2>
                    <p>Información de pagos próximamente...</p>
                </div>
            )}
        </div>
    )
}

export default ContentPageUpdate
