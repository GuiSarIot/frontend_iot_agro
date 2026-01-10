'use client'

import { useState, useEffect, useContext, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import ConsumerAPIFormData from '@/components/shared/consumerAPI/consumerAPIFormData'
import AppContext from '@/context/appContext'

import NotificationsTab from './components/NotificationsTab'
import PaymentTab from './components/PaymentTab'
import PersonalInfoTab from './components/PersonalInfoTab'
import SecurityTab from './components/SecurityTab'
import { UserInfoForm } from './components/types'
import UpdateProfileTab from './components/UpdateProfileTab'
import styles from './styles.module.css'

// Tipos para props
interface InfoPage {
    title: string
    route: string
}

interface ContentPageUpdateProps {
    infoPage?: InfoPage
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
    
    // Estados para notificaciones
    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: false,
        telegram_notifications: false,
        telegram_chat_id: ''
    })

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
            // Inicializar configuración de notificaciones
            setNotificationSettings({
                email_notifications: (data as UserInfoForm).telegram_notifications_enabled || false,
                telegram_notifications: (data as UserInfoForm).telegram_notifications_enabled || false,
                telegram_chat_id: (data as UserInfoForm).telegram_chat_id || ''
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

    const handleNotificationToggle = (type: 'email' | 'telegram') => {
        setNotificationSettings(prev => ({
            ...prev,
            [`${type}_notifications`]: !prev[`${type}_notifications`]
        }))
    }

    const handleTelegramIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationSettings(prev => ({
            ...prev,
            telegram_chat_id: e.target.value
        }))
    }

    const handleSaveNotifications = async () => {
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
            const { status, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userInfoForm.id}/`,
                method: 'PATCH',
                body: {
                    telegram_notifications_enabled: notificationSettings.telegram_notifications,
                    telegram_chat_id: notificationSettings.telegram_chat_id
                }
            })

            showLoader(false)

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: message || 'No se pudo guardar la configuración'
                })
                return
            }

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Configuración de notificaciones guardada correctamente',
                confirmButtonColor: '#00a86b'
            })

            // Recargar información del usuario
            loadInfoUser()
        } catch {
            showLoader(false)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar la configuración'
            })
        }
    }

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Está a punto de cerrar su sesión',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#00a86b',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Limpiar token y redirigir al login
                localStorage.removeItem('token')
                localStorage.removeItem('refresh_token')
                _router.push('/login')
            }
        })
    }

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar cuenta?',
            html: '<p>Esta acción eliminará permanentemente su cuenta y todos sus datos.</p><p><strong>Esta acción no se puede deshacer.</strong></p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar mi cuenta',
            cancelButtonText: 'Cancelar',
            input: 'text',
            inputPlaceholder: 'Escriba "ELIMINAR" para confirmar',
            inputValidator: (value) => {
                if (value !== 'ELIMINAR') {
                    return 'Debe escribir "ELIMINAR" para confirmar'
                }
            }
        })

        if (result.isConfirmed) {
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
                const { status, message } = await ConsumerAPI({
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userInfoForm.id}/`,
                    method: 'DELETE'
                })

                showLoader(false)

                if (status === 'error') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al eliminar',
                        text: message || 'No se pudo eliminar la cuenta'
                    })
                    return
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Cuenta eliminada',
                    text: 'Su cuenta ha sido eliminada correctamente',
                    confirmButtonColor: '#00a86b'
                }).then(() => {
                    // Limpiar sesión y redirigir
                    localStorage.removeItem('token')
                    localStorage.removeItem('refresh_token')
                    _router.push('/login')
                })
            } catch {
                showLoader(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar la cuenta'
                })
            }
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
        { id: 'payment', label: 'Pago', icon: '💳' }
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
                <PersonalInfoTab
                    userInfo={userInfoForm}
                    getInitials={getInitials}
                    formatDate={formatDate}
                />
            )}

            {activeTab === 'update-profile' && (
                <UpdateProfileTab
                    userInfo={userInfoForm}
                    formData={formData}
                    selectedFile={selectedFile}
                    previewImage={previewImage}
                    getInitials={getInitials}
                    formatDate={formatDate}
                    handleInputChange={handleInputChange}
                    handleFileSelect={handleFileSelect}
                    handleSubmit={handleSubmit}
                />
            )}

            {activeTab === 'notifications' && (
                <NotificationsTab
                    userInfo={userInfoForm}
                    notificationSettings={notificationSettings}
                    getInitials={getInitials}
                    formatDate={formatDate}
                    handleNotificationToggle={handleNotificationToggle}
                    handleTelegramIdChange={handleTelegramIdChange}
                    onTelegramVerified={loadInfoUser}
                />
            )}

            {activeTab === 'security' && (
                <SecurityTab
                    userInfo={userInfoForm}
                    getInitials={getInitials}
                    formatDate={formatDate}
                    handleLogout={handleLogout}
                    handleDeleteAccount={handleDeleteAccount}
                />
            )}

            {activeTab === 'payment' && (
                <PaymentTab
                    userInfo={userInfoForm}
                    getInitials={getInitials}
                    formatDate={formatDate}
                />
            )}
        </div>
    )
}

export default ContentPageUpdate
