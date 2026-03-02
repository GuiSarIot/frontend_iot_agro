'use client'

import { useState, useEffect } from 'react'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { MqttControlPanel } from '@/components/shared/MqttControlPanel'
import styles from './simuladores.module.css'

/**
 * Página de prueba de simuladores MQTT
 * 
 * Permite seleccionar un dispositivo y controlarlo mediante comandos MQTT
 */
export default function SimuladoresMqttPage() {
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [selectedDevice, setSelectedDevice] = useState<Dispositivo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notification, setNotification] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    // Cargar dispositivos
    useEffect(() => {
        loadDevices()
    }, [])

    const loadDevices = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await dispositivosService.getAll()
            const devices = response.results || []
            setDispositivos(devices)

            // Seleccionar el primer dispositivo por defecto
            if (devices.length > 0 && !selectedDevice) {
                setSelectedDevice(devices[0])
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            setError(errorMessage)
            console.error('Error cargando dispositivos:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeviceSelect = (deviceId: string) => {
        const device = dispositivos.find(d => d.identificador_unico === deviceId)
        if (device) {
            setSelectedDevice(device)
        }
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const handleSuccess = (message: string) => {
        showNotification('success', message)
    }

    const handleError = (error: string) => {
        showNotification('error', error)
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Cargando dispositivos...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>❌ Error</h2>
                    <p>{error}</p>
                    <button onClick={loadDevices} className={styles.retryButton}>
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        )
    }

    if (dispositivos.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <h2>📱 No hay dispositivos</h2>
                    <p>No se encontraron dispositivos para controlar.</p>
                    <button onClick={loadDevices} className={styles.retryButton}>
                        🔄 Actualizar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1>🌐 Simuladores MQTT</h1>
                    <p>Control de dispositivos IoT en tiempo real</p>
                </div>
                <button onClick={loadDevices} className={styles.refreshButton}>
                    🔄 Actualizar
                </button>
            </header>

            {/* Notificaciones */}
            {notification && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <span>
                        {notification.type === 'success' ? '✓' : '✗'} {notification.message}
                    </span>
                    <button onClick={() => setNotification(null)} className={styles.closeNotification}>
                        ×
                    </button>
                </div>
            )}

            {/* Selector de dispositivo */}
            <div className={styles.deviceSelector}>
                <label>
                    <strong>Dispositivo:</strong>
                </label>
                <select
                    value={selectedDevice?.identificador_unico || ''}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    className={styles.select}
                >
                    {dispositivos.map(device => (
                        <option key={device.id} value={device.identificador_unico}>
                            {device.nombre} ({typeof device.tipo === 'string' ? device.tipo : device.tipo?.nombre || ''}) - {device.ubicacion}
                        </option>
                    ))}
                </select>
            </div>

            {/* Grid de información y control */}
            <div className={styles.grid}>
                {/* Información del dispositivo */}
                <div className={styles.card}>
                    <h3>📱 Información del Dispositivo</h3>
                    {selectedDevice && (
                        <div className={styles.deviceInfo}>
                            <div className={styles.infoRow}>
                                <label>ID:</label>
                                <span>{selectedDevice.identificador_unico}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Nombre:</label>
                                <span>{selectedDevice.nombre}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Tipo:</label>
                                <span>{typeof selectedDevice.tipo === 'string' ? selectedDevice.tipo : selectedDevice.tipo?.nombre || ''}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Ubicación:</label>
                                <span>{selectedDevice.ubicacion}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Estado:</label>
                                <span className={`${styles.status} ${styles[selectedDevice.estado]}`}>
                                    {selectedDevice.estado}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Descripción:</label>
                                <span>{selectedDevice.descripcion || 'N/A'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Panel de control MQTT */}
                {selectedDevice && (
                    <div className={styles.controlPanelWrapper}>
                        <MqttControlPanel
                            dispositivo={selectedDevice}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    </div>
                )}
            </div>

            {/* Información adicional */}
            <div className={styles.infoBox}>
                <h3>ℹ️ Información sobre Simuladores MQTT</h3>
                <p>
                    Esta página permite controlar dispositivos IoT mediante comandos MQTT en tiempo real.
                </p>
                <ul>
                    <li><strong>Control de LED:</strong> Encender, apagar o alternar el estado del LED</li>
                    <li><strong>Control de Dimmer:</strong> Ajustar el nivel de intensidad (0-100%)</li>
                    <li><strong>Lectura de Sensores:</strong> Solicitar lecturas de temperatura, humedad, etc.</li>
                    <li><strong>Estado del Sistema:</strong> Obtener información completa del dispositivo</li>
                </ul>
                <p className={styles.warning}>
                    ⚠️ Asegúrate de que el simulador MQTT esté ejecutándose y conectado al broker.
                </p>
            </div>
        </div>
    )
}
