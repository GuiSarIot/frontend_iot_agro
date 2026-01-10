'use client'

import { useState, useEffect } from 'react'

import { emailService, SendEmailNotificationRequest } from '@/app/services/email.service'

import styles from '../notifications.module.css'

const EmailNotificationsPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formData, setFormData] = useState<SendEmailNotificationRequest>({
        subject: '',
        message: '',
        notification_type: 'info',
        send_to_all_verified: false,
        user_ids: [],
    })
    const [userIdsInput, setUserIdsInput] = useState('')

    useEffect(() => {
        document.title = 'Notificaciones Email - IOTCorp'
    }, [])

    const handleSendNotification = async () => {
        if (!formData.subject.trim()) {
            setError('Por favor ingresa un asunto')
            return
        }

        if (!formData.message.trim()) {
            setError('Por favor ingresa un mensaje')
            return
        }

        try {
            setLoading(true)
            setError(null)
            setSuccess(null)

            // Parsear user_ids si no se envía a todos
            const request: SendEmailNotificationRequest = {
                ...formData,
            }

            if (!formData.send_to_all_verified && userIdsInput) {
                const ids = userIdsInput
                    .split(',')
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id))

                if (ids.length === 0) {
                    setError('Por favor ingresa IDs de usuario válidos')
                    return
                }

                request.user_ids = ids
            }

            const response = await emailService.sendNotification(request)
            setSuccess(response.message)
            
            // Limpiar formulario
            setFormData({
                subject: '',
                message: '',
                notification_type: 'info',
                send_to_all_verified: false,
                user_ids: [],
            })
            setUserIdsInput('')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al enviar la notificación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Enviar Notificaciones por Email</h1>
                    <p className={styles.pageSubtitle}>
                        Envía notificaciones a usuarios con cuentas de email verificadas
                    </p>
                </div>

                {error && (
                    <div className={`${styles.alert} ${styles.error}`}>
                        <span className={styles.alertIcon}>⚠️</span>
                        <span className={styles.alertContent}>{error}</span>
                        <button className={styles.alertClose} onClick={() => setError(null)}>×</button>
                    </div>
                )}

                {success && (
                    <div className={`${styles.alert} ${styles.success}`}>
                        <span className={styles.alertIcon}>✓</span>
                        <span className={styles.alertContent}>{success}</span>
                        <button className={styles.alertClose} onClick={() => setSuccess(null)}>×</button>
                    </div>
                )}

                <div className={styles.card}>
                    {/* Asunto */}
                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles.required}`}>
                            Asunto
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Ingresa el asunto del correo..."
                        />
                    </div>

                    {/* Mensaje */}
                    <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles.required}`}>
                            Mensaje
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Escribe el mensaje que deseas enviar..."
                            rows={6}
                        />
                    </div>

                    {/* Tipo de notificación */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Tipo de notificación
                        </label>
                        <select
                            className={styles.select}
                            value={formData.notification_type}
                            onChange={(e) => setFormData({ ...formData, notification_type: e.target.value as 'info' | 'success' | 'warning' | 'error' })}
                        >
                            <option value="info">
                                ℹ️ Información
                            </option>
                            <option value="success">
                                ✓ Éxito
                            </option>
                            <option value="warning">
                                ⚠️ Advertencia
                            </option>
                            <option value="error">
                                ✕ Error
                            </option>
                        </select>
                        <div style={{ marginTop: '0.75rem' }}>
                            <span className={`${styles.typeBadge} ${styles[formData.notification_type || 'info']}`}>
                                {formData.notification_type === 'info' && 'ℹ️ Info'}
                                {formData.notification_type === 'success' && '✓ Success'}
                                {formData.notification_type === 'warning' && '⚠️ Warning'}
                                {formData.notification_type === 'error' && '✕ Error'}
                            </span>
                        </div>
                    </div>

                    {/* Destinatarios */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Destinatarios
                        </label>
                        <select
                            className={styles.select}
                            value={formData.send_to_all_verified ? 'all' : 'specific'}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                send_to_all_verified: e.target.value === 'all' 
                            })}
                        >
                            <option value="specific">Usuarios específicos</option>
                            <option value="all">Todos los usuarios verificados</option>
                        </select>
                    </div>

                    {/* IDs de usuarios (solo si no se envía a todos) */}
                    {!formData.send_to_all_verified && (
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                IDs de usuarios
                            </label>
                            <input
                                type="text"
                                className={styles.input}
                                value={userIdsInput}
                                onChange={(e) => setUserIdsInput(e.target.value)}
                                placeholder="Ej: 1, 2, 3"
                            />
                            <p className={styles.helperText}>
                                Ingresa los IDs de los usuarios separados por comas
                            </p>
                        </div>
                    )}

                    {/* Botón de envío */}
                    <button
                        className={styles.submitButton}
                        onClick={handleSendNotification}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                Enviar notificación por email
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmailNotificationsPage
