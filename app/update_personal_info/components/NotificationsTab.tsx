import React, { useState, useEffect } from 'react'

import Swal from 'sweetalert2'

import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'

import ProfileCardCentered from './ProfileCardCentered'
import TelegramSettings from './TelegramSettings'
import EmailSettings from './EmailSettings'
import { UserInfoForm, NotificationSettings } from './types'
import styles from '../styles.module.css'

interface TelegramStatus {
    is_linked: boolean
    is_verified: boolean
    notifications_enabled: boolean
    can_receive_notifications: boolean
    telegram_username?: string
    has_pending_verification: boolean
}

interface EmailStatus {
    has_email: boolean
    email?: string
    is_verified: boolean
    notifications_enabled: boolean
    can_receive_notifications: boolean
    verification_sent_at?: string
    has_pending_verification: boolean
}

interface NotificationsTabProps {
    userInfo: UserInfoForm
    notificationSettings: NotificationSettings
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
    handleNotificationToggle: (type: 'email' | 'telegram') => void
    handleTelegramIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onTelegramVerified: () => void
}

export default function NotificationsTab({
    userInfo,
    notificationSettings,
    getInitials,
    formatDate,
    handleNotificationToggle,
    handleTelegramIdChange,
    onTelegramVerified
}: NotificationsTabProps) {
    const [verificationCode, setVerificationCode] = useState<string>('')
    const [isGeneratingCode, setIsGeneratingCode] = useState(false)
    const [telegramUsername, setTelegramUsername] = useState<string>(userInfo.telegram_username || '')
    const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null)
    const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
    const [isLoadingStatus, setIsLoadingStatus] = useState(true)

    useEffect(() => {
        loadTelegramStatus()
        loadEmailStatus()
    }, [])

    const loadTelegramStatus = async () => {
        try {
            const { status, data, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/telegram/status/`
            })

            if (status === 'error') {
                console.error('Error al cargar estado de Telegram:', message)
                return
            }

            if (data) {
                setTelegramStatus(data as TelegramStatus)
            }
        } catch (error) {
            console.error('Error al cargar estado de Telegram:', error)
        } finally {
            setIsLoadingStatus(false)
        }
    }

    const loadEmailStatus = async () => {
        try {
            const { status, data, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/email/status/`
            })

            if (status === 'error') {
                console.error('Error al cargar estado de Email:', message)
                return
            }

            if (data) {
                setEmailStatus(data as EmailStatus)
            }
        } catch (error) {
            console.error('Error al cargar estado de Email:', error)
        }
    }

    const handleGenerateVerificationCode = async () => {
        setIsGeneratingCode(true)

        try {
            const { status, data, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/telegram/generate-verification/`,
                method: 'POST'
            })

            setIsGeneratingCode(false)

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message || 'No se pudo generar el código de verificación',
                    confirmButtonColor: '#d33'
                })
                return
            }

            if (data && data.verification_code) {
                setVerificationCode(data.verification_code)

                Swal.fire({
                    icon: 'success',
                    title: '¡Código generado!',
                    html: `
                        <div style="text-align: center;">
                            <p style="margin: 15px 0;">Envía este código a <strong>@iot_sensor_platform_bot</strong> en Telegram:</p>
                            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <code style="font-size: 24px; font-weight: bold; color: #00a86b; letter-spacing: 3px;">${data.verification_code}</code>
                            </div>
                            <p style="color: #666; font-size: 14px;">El código expira en ${data.expires_in_minutes || 15} minutos</p>
                        </div>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#00a86b',
                    showCancelButton: true,
                    cancelButtonText: 'Copiar código',
                    cancelButtonColor: '#3085d6'
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.cancel) {
                        // Copiar código al portapapeles
                        navigator.clipboard.writeText(data.verification_code)
                        Swal.fire({
                            icon: 'success',
                            title: 'Código copiado',
                            text: 'El código ha sido copiado al portapapeles',
                            timer: 2000,
                            showConfirmButton: false
                        })
                    }
                })
                
                // Recargar estado de Telegram
                loadTelegramStatus()
            }
        } catch (error) {
            setIsGeneratingCode(false)
            console.error('Error al generar código:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al generar el código de verificación',
                confirmButtonColor: '#d33'
            })
        }
    }

    const handleTelegramUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTelegramUsername(e.target.value)
    }

    const handleSaveTelegramUsername = async () => {
        if (!telegramUsername || telegramUsername.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor ingresa tu usuario de Telegram',
                confirmButtonColor: '#3085d6'
            })
            return
        }

        try {
            const { status, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userInfo.id}/`,
                method: 'PATCH',
                body: {
                    telegram_username: telegramUsername.startsWith('@') ? telegramUsername : `@${telegramUsername}`
                }
            })

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message || 'No se pudo guardar el usuario de Telegram',
                    confirmButtonColor: '#d33'
                })
                return
            }

            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Usuario de Telegram guardado correctamente',
                timer: 2000,
                showConfirmButton: false
            })

            onTelegramVerified()
            
            // Recargar estado de Telegram
            loadTelegramStatus()
        } catch (error) {
            console.error('Error al guardar usuario de Telegram:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar el usuario de Telegram',
                confirmButtonColor: '#d33'
            })
        }
    }

    const handleToggleEmailNotifications = async () => {
        const newState = !notificationSettings.email_notifications
        const endpoint = newState ? 'enable-notifications' : 'disable-notifications'

        try {
            const { status, data, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/email/${endpoint}/`,
                method: 'POST'
            })

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message || `No se pudo ${newState ? 'activar' : 'desactivar'} las notificaciones por email`,
                    confirmButtonColor: '#d33'
                })
                return
            }

            // Actualizar el estado local
            handleNotificationToggle('email')

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: `Notificaciones por email ${newState ? 'activadas' : 'desactivadas'} correctamente`,
                timer: 2000,
                showConfirmButton: false
            })

            // Recargar información del usuario
            onTelegramVerified()
            
            // Recargar estados
            loadTelegramStatus()
            loadEmailStatus()
        } catch (error) {
            console.error('Error al actualizar notificaciones por email:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar las notificaciones por email',
                confirmButtonColor: '#d33'
            })
        }
    }

    const handleToggleTelegramNotifications = async () => {
        const newState = !notificationSettings.telegram_notifications
        const endpoint = newState ? 'enable-notifications' : 'disable-notifications'

        // Validar que el usuario tenga cuenta de Telegram verificada antes de activar
        if (newState && !userInfo.telegram_verified) {
            Swal.fire({
                icon: 'warning',
                title: 'Cuenta no verificada',
                text: 'Debes verificar tu cuenta de Telegram antes de activar las notificaciones',
                confirmButtonColor: '#3085d6'
            })
            return
        }

        try {
            const { status, data, message } = await ConsumerAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/telegram/${endpoint}/`,
                method: 'POST'
            })

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message || `No se pudo ${newState ? 'activar' : 'desactivar'} las notificaciones de Telegram`,
                    confirmButtonColor: '#d33'
                })
                return
            }

            // Actualizar el estado local
            handleNotificationToggle('telegram')

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: `Notificaciones de Telegram ${newState ? 'activadas' : 'desactivadas'} correctamente`,
                timer: 2000,
                showConfirmButton: false
            })

            // Recargar información del usuario
            onTelegramVerified()
            
            // Recargar estados
            loadTelegramStatus()
            loadEmailStatus()
        } catch (error) {
            console.error('Error al actualizar notificaciones de Telegram:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar las notificaciones de Telegram',
                confirmButtonColor: '#d33'
            })
        }
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Configuración */}
            <div className={styles.infoPanel}>
                <h2 className={styles.sectionTitle}>Configuración de las notificaciones</h2>
                <p className={styles.sectionSubtitle}>Notificaciones mediante correo electrónico y Telegram</p>

                <div className={styles.notificationsSection}>
                    <h3 className={styles.notificationTitle}>Habilitar/Deshabilitar las alertas de dispositivos</h3>
                    
                    {/* Componente de Email */}
                    <div style={{ marginBottom: '30px' }}>
                        <EmailSettings />
                    </div>
                    
                    {/* Componente de Telegram */}
                    <div>
                        <TelegramSettings />
                    </div>
                </div>
            </div>

            {/* Panel derecho - Card de perfil */}
            <ProfileCardCentered
                userInfo={userInfo}
                getInitials={getInitials}
                formatDate={formatDate}
            />
        </div>
    )
}
