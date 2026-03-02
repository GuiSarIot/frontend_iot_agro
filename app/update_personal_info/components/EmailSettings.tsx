'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { emailService, EmailStatus } from '@/app/services/email.service'
import styles from './EmailSettings.module.css'

const EmailSettings = () => {
    const [status, setStatus] = useState<EmailStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    // Cargar estado inicial
    useEffect(() => {
        loadStatus()
    }, [])

    const loadStatus = async () => {
        try {
            setLoading(true)
            const data = await emailService.getStatus()
            setStatus(data)
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al cargar el estado del email',
                confirmButtonColor: '#d33'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSendVerification = async () => {
        try {
            setSending(true)
            const response = await emailService.sendVerification()
            
            Swal.fire({
                icon: 'success',
                title: '📧 Email enviado',
                html: `
                    <p>${response.message}</p>
                    <p style="margin-top: 10px; font-size: 14px; color: #666;">
                        Revisa tu bandeja de entrada en: <strong>${response.sent_to}</strong>
                    </p>
                    <p style="margin-top: 10px; font-size: 12px; color: #999;">
                        No olvides revisar la carpeta de spam
                    </p>
                `,
                confirmButtonColor: '#00a86b',
                timer: 6000
            })
            
            await loadStatus()
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al enviar email de verificación',
                confirmButtonColor: '#d33'
            })
        } finally {
            setSending(false)
        }
    }

    const handleToggleNotifications = async (enabled: boolean) => {
        try {
            const response = await emailService.updatePreferences(enabled)
            
            // Actualizar estado local inmediatamente
            setStatus(prev => prev ? {
                ...prev,
                notifications_enabled: response.email_notifications_enabled,
                can_receive_notifications: response.can_receive_email_notifications
            } : null)
            
            Swal.fire({
                icon: 'success',
                title: enabled ? '✅ Notificaciones activadas' : '🔕 Notificaciones desactivadas',
                text: response.message,
                timer: 2000,
                showConfirmButton: false
            })
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al actualizar las notificaciones',
                confirmButtonColor: '#d33'
            })
            await loadStatus()
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
            </div>
        )
    }

    return (
        <div className={styles.emailContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                </div>
                <div className={styles.headerText}>
                    <h2>Notificaciones por Email</h2>
                    <p>Recibe alertas en tu correo electrónico</p>
                </div>
            </div>

            <div className={styles.contentWrapper}>
                {/* Estado de verificación */}
                <div className={styles.statusSection}>
                    <div className={styles.statusBadges}>
                        {status?.has_email && (
                            <span className={`${styles.badge} ${styles.badgePrimary}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                {status.email || 'Email configurado'}
                            </span>
                        )}
                        {status?.is_verified && (
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Verificado
                            </span>
                        )}
                    </div>

                    <div className={styles.switchContainer}>
                        <div className={styles.switchLabel}>
                            <span className="labelText">Activar notificaciones por email</span>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={status?.notifications_enabled || false}
                                onChange={(e) => handleToggleNotifications(e.target.checked)}
                                disabled={!status?.is_verified}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    {/* Mensajes informativos basados en el estado */}
                    {status?.notifications_enabled && status?.can_receive_notifications && (
                        <div className={`${styles.statusMessage} ${styles.success}`}>
                            ✅ Estás recibiendo notificaciones por email
                        </div>
                    )}
                    
                    {!status?.can_receive_notifications && status?.notifications_enabled && (
                        <div className={`${styles.statusMessage} ${styles.warning}`}>
                            ⚠️ Las notificaciones están activadas pero necesitas verificar tu email
                        </div>
                    )}
                    
                    {!status?.is_verified && (
                        <div className={`${styles.statusMessage} ${styles.info}`}>
                            ℹ️ Verifica tu email para activar las notificaciones
                        </div>
                    )}

                    {/* Información de verificación pendiente */}
                    {status?.has_pending_verification && !status?.is_verified && (
                        <div className={`${styles.alert} ${styles.info}`}>
                            <div className={styles.alertTitle}>
                                📬 Email de verificación enviado
                            </div>
                            <div className={styles.alertContent}>
                                • Revisa tu bandeja de entrada: <strong>{status.email}</strong><br />
                                • No olvides revisar la carpeta de spam<br />
                                • El link de verificación expira en 24 horas<br />
                                {status.verification_sent_at && (
                                    <>• Enviado: {new Date(status.verification_sent_at).toLocaleString('es-ES')}</>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Instrucciones */}
                    {!status?.is_verified && status?.has_email && (
                        <div className={styles.infoBox}>
                            <div className={styles.infoTitle}>
                                ℹ️ Para verificar tu email:
                            </div>
                            <ol>
                                <li>Haz clic en "Enviar verificación"</li>
                                <li>Revisa tu correo electrónico</li>
                                <li>Haz clic en el link de verificación</li>
                                <li>¡Listo! Podrás recibir notificaciones por email</li>
                            </ol>
                        </div>
                    )}

                    {!status?.has_email && (
                        <div className={`${styles.statusMessage} ${styles.warning}`}>
                            ⚠️ No tienes un email configurado. Por favor, contacta al administrador.
                        </div>
                    )}
                </div>

                {/* Botones de acción - En la esquina inferior derecha */}
                {!status?.is_verified && status?.has_email && (
                    <div className={styles.actions}>
                        <button
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            onClick={handleSendVerification}
                            disabled={sending}
                        >
                            {sending ? (
                                <>
                                    <div className={styles.loadingSpinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                    {status.has_pending_verification ? 'Reenviar verificación' : 'Enviar verificación'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmailSettings
