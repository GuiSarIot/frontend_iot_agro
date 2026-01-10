'use client'

import { useState, useEffect } from 'react'

import { telegramService, SendNotificationRequest } from '@/app/services/telegram.service'

import styles from '../notifications.module.css'

const TelegramNotificationsPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formData, setFormData] = useState<SendNotificationRequest>({
        message: '',
        notification_type: 'info',
        send_to_all_verified: false,
        user_ids: [],
    })
    const [userIdsInput, setUserIdsInput] = useState('')

    useEffect(() => {
        document.title = 'Notificaciones Telegram - IOTCorp'
    }, [])

    const handleSendNotification = async () => {
        if (!formData.message.trim()) {
            setError('Por favor ingresa un mensaje')
            return
        }

        try {
            setLoading(true)
            setError(null)
            setSuccess(null)

            // Parsear user_ids si no se envía a todos
            const request: SendNotificationRequest = {
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

            const response = await telegramService.sendNotification(request)
            setSuccess(response.message)
            
            // Limpiar formulario
            setFormData({
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
                    <h1 className={styles.pageTitle}>Enviar Notificaciones de Telegram</h1>
                    <p className={styles.pageSubtitle}>
                        Envía notificaciones a usuarios con cuentas de Telegram vinculadas y verificadas
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
                            rows={5}
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
                            onChange={(e) => setFormData({ ...formData, notification_type: e.target.value as SendNotificationRequest['notification_type'] })}
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
                            <span className={`${styles.typeBadge} ${styles[formData.notification_type]}`}>
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
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                                Enviar notificación
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TelegramNotificationsPage
