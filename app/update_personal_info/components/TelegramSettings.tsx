'use client'

import { useState, useEffect } from 'react'

import Swal from 'sweetalert2'

import { telegramService, TelegramStatus } from '@/app/services/telegram.service'

import styles from './TelegramSettings.module.css'

const TelegramSettings = () => {
    const [status, setStatus] = useState<TelegramStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [verificationCode, setVerificationCode] = useState<string | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [expiresIn, setExpiresIn] = useState<number | null>(null)
    const [polling, setPolling] = useState(false)

    // Cargar estado inicial
    useEffect(() => {
        loadStatus()
    }, [])

    // Polling para detectar vinculación automática
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        
        if (polling && openDialog) {
            interval = setInterval(async () => {
                try {
                    const data = await telegramService.getStatus()
                    setStatus(data)
                    
                    // Si se vinculó exitosamente, detener polling y cerrar diálogo
                    if (data.is_linked && data.is_verified) {
                        setPolling(false)
                        setOpenDialog(false)
                        
                        Swal.fire({
                            icon: 'success',
                            title: '¡Vinculación exitosa!',
                            html: `
                                <p>✅ Cuenta vinculada correctamente</p>
                                <p>Usuario: <strong>${data.telegram_username || 'Tu cuenta'}</strong></p>
                                <p>Las notificaciones están activadas automáticamente</p>
                            `,
                            confirmButtonColor: '#00a86b',
                            timer: 5000
                        })
                    }
                } catch (err) {
                    console.error('Error en polling:', err)
                }
            }, 3000) // Verificar cada 3 segundos
        }
        
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [polling, openDialog])

    const loadStatus = async () => {
        try {
            setLoading(true)
            const data = await telegramService.getStatus()
            setStatus(data)
        } catch (err: unknown) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err instanceof Error ? err.message : 'Error al cargar el estado de Telegram',
                confirmButtonColor: '#d33'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateCode = async () => {
        try {
            const response = await telegramService.generateVerificationCode()
            setVerificationCode(response.verification_code)
            setExpiresIn(response.expires_in_minutes)
            setOpenDialog(true)
            setPolling(true) // Iniciar polling para detectar vinculación
            
            Swal.fire({
                icon: 'info',
                title: '📱 Código generado',
                html: `
                    <p>${response.message}</p>
                    <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        El sistema detectará automáticamente cuando vincules tu cuenta
                    </p>
                `,
                timer: 4000,
                showConfirmButton: false
            })
        } catch (err: unknown) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err instanceof Error ? err.message : 'Error al generar código de verificación',
                confirmButtonColor: '#d33'
            })
        }
    }

    const handleCopyCode = () => {
        if (verificationCode) {
            navigator.clipboard.writeText(verificationCode)
            Swal.fire({
                icon: 'success',
                title: 'Código copiado',
                text: 'El código ha sido copiado al portapapeles',
                timer: 2000,
                showConfirmButton: false
            })
        }
    }

    const handleUnlink = async () => {
        const result = await Swal.fire({
            title: '¿Desvincular cuenta?',
            text: '¿Estás seguro de que deseas desvincular tu cuenta de Telegram?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, desvincular',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) {
            return
        }

        try {
            const response = await telegramService.unlinkAccount()
            
            Swal.fire({
                icon: 'success',
                title: '¡Desvinculado!',
                text: response.message,
                confirmButtonColor: '#00a86b'
            })
            
            await loadStatus()
        } catch (err: unknown) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err instanceof Error ? err.message : 'Error al desvincular la cuenta',
                confirmButtonColor: '#d33'
            })
        }
    }

    const handleToggleNotifications = async (enabled: boolean) => {
        try {
            // Usar el endpoint de preferencias (más flexible, sin validaciones estrictas)
            const response = await telegramService.updatePreferences(enabled)
            
            // Actualizar estado local inmediatamente
            setStatus(prev => prev ? {
                ...prev,
                notifications_enabled: response.telegram_notifications_enabled,
                can_receive_notifications: response.can_receive_notifications
            } : null)
            
            Swal.fire({
                icon: 'success',
                title: enabled ? '✅ Notificaciones activadas' : '🔕 Notificaciones desactivadas',
                text: response.message,
                timer: 2000,
                showConfirmButton: false
            })
        } catch (err: unknown) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err instanceof Error ? err.message : 'Error al actualizar las notificaciones',
                confirmButtonColor: '#d33'
            })
            // Recargar el estado para revertir el cambio en caso de error
            await loadStatus()
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setPolling(false) // Detener polling al cerrar manualmente
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
            </div>
        )
    }

    return (
        <>
            <div className={styles.telegramContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                        </svg>
                    </div>
                    <div className={styles.headerText}>
                        <h2>Notificaciones de Telegram</h2>
                        <p>Recibe alertas y notificaciones en tiempo real</p>
                    </div>
                </div>

                <div className={styles.contentWrapper}>
                    {/* Estado de vinculación */}
                    <div className={styles.statusSection}>
                        <div className={styles.statusBadges}>
                            {status?.is_linked && (
                                <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                    Cuenta vinculada
                                </span>
                            )}
                            {status?.is_verified && (
                                <span className={`${styles.badge} ${styles.badgePrimary}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                    Verificada
                                </span>
                            )}
                            {status?.telegram_username && (
                                <span className={`${styles.badge} ${styles.badgeOutlined}`}>
                                    @{status.telegram_username}
                                </span>
                            )}
                        </div>

                        <div className={styles.switchContainer}>
                            <div className={styles.switchLabel}>
                                <span className="labelText">Activar notificaciones de Telegram</span>
                                {!status?.is_linked && (
                                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                                        (Primero debes vincular tu cuenta)
                                    </span>
                                )}
                                {status?.is_linked && !status?.is_verified && (
                                    <span style={{ fontSize: '12px', color: '#ffc107', marginLeft: '8px' }}>
                                        (Pendiente de verificación)
                                    </span>
                                )}
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={status?.notifications_enabled || false}
                                    onChange={(e) => handleToggleNotifications(e.target.checked)}
                                    disabled={!status?.is_linked || !status?.is_verified}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {/* Mensajes informativos basados en el estado */}
                        {status?.notifications_enabled && status?.can_receive_notifications && (
                            <div className={`${styles.statusMessage} ${styles.success}`}>
                                ✅ Estás recibiendo notificaciones de Telegram
                            </div>
                        )}
                        
                        {!status?.can_receive_notifications && status?.notifications_enabled && (
                            <div className={`${styles.statusMessage} ${styles.warning}`}>
                                ⚠️ Las notificaciones están activadas pero no se pueden recibir hasta que vincules y verifiques tu cuenta
                            </div>
                        )}
                        
                        {!status?.is_linked && (
                            <div className={`${styles.statusMessage} ${styles.info}`}>
                                ℹ️ Debes vincular tu cuenta de Telegram para activar las notificaciones
                            </div>
                        )}
                        
                        {status?.is_linked && !status?.is_verified && (
                            <div className={`${styles.statusMessage} ${styles.warning}`}>
                                ⚠️ Cuenta vinculada pero pendiente de verificación
                            </div>
                        )}

                        {/* Instrucciones */}
                        {!status?.is_linked && (
                            <div className={styles.infoBox}>
                                <div className={styles.infoTitle}>
                                    ℹ️ Para vincular tu cuenta de Telegram:
                                </div>
                                <ol>
                                    <li>Haz clic en "Vincular cuenta de Telegram" (abajo a la derecha)</li>
                                    <li>Se generará un código de verificación único</li>
                                    <li>Abre Telegram y busca el bot: <strong>@iot_sensor_platform_bot</strong></li>
                                    <li>Envía el código al bot</li>
                                    <li>¡Listo! Tu cuenta estará vinculada y podrás activar las notificaciones</li>
                                </ol>
                                <p style={{ marginTop: '12px', padding: '10px', background: '#fff3cd', borderLeft: '4px solid #ffc107', fontSize: '13px', color: '#856404', borderRadius: '4px' }}>
                                    <strong>Nota:</strong> Debes vincular tu cuenta de Telegram antes de poder activar las notificaciones. El correo verificado es un requisito previo, pero necesitas completar la vinculación de Telegram.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción - Ahora en la esquina inferior derecha */}
                    <div className={styles.actions}>
                        {!status?.is_linked ? (
                            <button
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                onClick={handleGenerateCode}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                </svg>
                                Vincular cuenta
                            </button>
                        ) : (
                            <button
                                className={`${styles.button} ${styles.buttonDanger}`}
                                onClick={handleUnlink}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 7h-4V3H5v4H1v13h16V7zM7 5h4v2H7V5zm8 13H3V9h12v9z"/>
                                </svg>
                                Desvincular cuenta
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Diálogo de verificación */}
            {openDialog && (
                <div className="modal-overlay" onClick={polling ? undefined : handleCloseDialog}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className={styles.dialogHeader}>
                            <div className={styles.dialogHeaderLeft}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                                </svg>
                                <h3>Código de verificación</h3>
                            </div>
                            {polling && (
                                <span className={styles.pollingBadge}>
                                    <div className={styles.spinner}></div>
                                    Esperando vinculación...
                                </span>
                            )}
                        </div>

                        <div className={styles.dialogContent}>
                            <div className={`${styles.alert} ${styles.info}`}>
                                Envía este código a <strong>@iot_sensor_platform_bot</strong> en Telegram
                                {polling && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                        🔄 Detectaremos automáticamente cuando vincules tu cuenta
                                    </div>
                                )}
                            </div>

                            {verificationCode && (
                                <div className={styles.codeBox}>
                                    <div className={styles.code}>{verificationCode}</div>
                                    <button className={styles.copyButton} onClick={handleCopyCode}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                        </svg>
                                        Copiar
                                    </button>
                                </div>
                            )}

                            {expiresIn && (
                                <div className={styles.expirationText}>
                                    ⏰ Expira en {expiresIn} minutos
                                </div>
                            )}

                            <div className={styles.instructionsBox}>
                                <div className={styles.title}>
                                    📋 Pasos para vincular:
                                </div>
                                <ol>
                                    <li>Copia el código usando el botón "Copiar"</li>
                                    <li>Abre Telegram y busca <strong>@iot_sensor_platform_bot</strong></li>
                                    <li><strong>⚠️ IMPORTANTE: Primero envía</strong> <code>/start</code> para iniciar el bot</li>
                                    <li><strong>Luego envía el código:</strong> <code>{verificationCode}</code></li>
                                    <li>O usa el comando: <code>/link {verificationCode}</code></li>
                                    <li>El bot confirmará la vinculación automáticamente</li>
                                </ol>
                            </div>

                            {polling ? (
                                <>
                                    <div className={`${styles.alert} ${styles.success}`}>
                                        <div className={styles.spinner}></div>
                                        Esperando confirmación... Este diálogo se cerrará automáticamente cuando vincules tu cuenta.
                                    </div>
                                    
                                    <div className={`${styles.alert} ${styles.warning}`}>
                                        <strong>⏳ ¿El bot no responde?</strong>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', lineHeight: '1.6' }}>
                                            1. Asegúrate de haber enviado <code>/start</code> primero<br />
                                            2. Verifica que escribiste el código exactamente como aparece<br />
                                            3. Confirma que el bot muestra "Bot" en su nombre (está activo)<br />
                                            4. Prueba con el comando: <code>/link {verificationCode}</code><br />
                                            5. Si sigue sin funcionar, contacta al administrador del sistema
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-color-secondary)', marginTop: '1rem' }}>
                                    💡 Tip: Puedes cerrar este diálogo y verificar el estado más tarde
                                </div>
                            )}
                        </div>

                        <div className={styles.dialogActions}>
                            <button 
                                onClick={async () => {
                                    const data = await telegramService.getStatus()
                                    setStatus(data)
                                    
                                    if (data.is_linked) {
                                        Swal.fire({
                                            icon: 'success',
                                            title: '✅ ¡Cuenta vinculada!',
                                            text: 'Tu cuenta se ha vinculado correctamente',
                                            timer: 2000
                                        })
                                        setPolling(false)
                                        setOpenDialog(false)
                                    } else {
                                        Swal.fire({
                                            icon: 'info',
                                            title: '⏳ Aún no vinculada',
                                            text: 'Asegúrate de enviar el código al bot en Telegram',
                                            timer: 2000
                                        })
                                    }
                                }}
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                            >
                                Verificar ahora
                            </button>
                            <button 
                                onClick={handleCloseDialog} 
                                disabled={polling}
                                className={styles.button}
                                style={{ 
                                    fontSize: '0.85rem', 
                                    padding: '0.5rem 1rem',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color-primary)',
                                    color: 'var(--text-color-primary)'
                                }}
                            >
                                {polling ? 'Esperando...' : 'Cerrar'}
                            </button>
                            {polling && (
                                <button 
                                    onClick={() => setPolling(false)} 
                                    className={`${styles.button} ${styles.buttonDanger}`}
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    Cancelar auto-detección
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TelegramSettings
