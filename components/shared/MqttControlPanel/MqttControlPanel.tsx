'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'
import type { Dispositivo } from '@/app/services/api.service'
import GamepadIcon from '@mui/icons-material/Gamepad'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import SensorsIcon from '@mui/icons-material/Sensors'
import SettingsIcon from '@mui/icons-material/Settings'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import AssessmentIcon from '@mui/icons-material/Assessment'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import styles from './MqttControlPanel.module.css'

/**
 * Props del componente
 */
interface MqttControlPanelProps {
    dispositivo: Dispositivo
    onSuccess?: (message: string) => void
    onError?: (error: string) => void
}

/**
 * Panel de control MQTT para dispositivos
 * 
 * Permite controlar LEDs, dimmers y leer sensores de dispositivos IoT
 * 
 * @example
 * ```tsx
 * <MqttControlPanel 
 *   dispositivo={dispositivo}
 *   onSuccess={(msg) => toast.success(msg)}
 *   onError={(err) => toast.error(err)}
 * />
 * ```
 */
export function MqttControlPanel({
    dispositivo,
    onSuccess,
    onError,
}: MqttControlPanelProps) {
    const {
        ledOn,
        ledOff,
        ledToggle,
        dimmerSet,
        readSensors,
        getStatus,
        restart,
        loading,
        error,
        lastResponse,
    } = useMqttCommands()

    const [dimmerLevel, setDimmerLevel] = useState(50)
    const [ledState, setLedState] = useState<boolean | null>(null)

    // Usar refs para callbacks para evitar ciclos infinitos
    const onSuccessRef = useRef(onSuccess)
    const onErrorRef = useRef(onError)

    useEffect(() => {
        onSuccessRef.current = onSuccess
        onErrorRef.current = onError
    }, [onSuccess, onError])

    // Notificar errores
    useEffect(() => {
        if (error && onErrorRef.current) {
            onErrorRef.current(error)
        }
    }, [error])

    // Notificar éxito
    useEffect(() => {
        if (lastResponse?.success && onSuccessRef.current) {
            onSuccessRef.current(lastResponse.message)
        }
    }, [lastResponse])

    // ============================================
    // HANDLERS LED
    // ============================================

    const handleLedOn = async () => {
        const response = await ledOn(dispositivo.id.toString())
        if (response?.success) {
            setLedState(true)
        }
    }

    const handleLedOff = async () => {
        const response = await ledOff(dispositivo.id.toString())
        if (response?.success) {
            setLedState(false)
        }
    }

    const handleLedToggle = async () => {
        const response = await ledToggle(dispositivo.id.toString())
        if (response?.success) {
            setLedState(prev => !prev)
        }
    }

    // ============================================
    // HANDLERS DIMMER
    // ============================================

    const handleDimmerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDimmerLevel(Number(e.target.value))
    }

    const handleDimmerSet = async () => {
        await dimmerSet(dispositivo.id.toString(), dimmerLevel)
    }

    // ============================================
    // HANDLERS SENSORES Y SISTEMA
    // ============================================

    const handleReadSensors = async () => {
        await readSensors(dispositivo.id.toString())
    }

    const handleGetStatus = async () => {
        await getStatus(dispositivo.id.toString())
    }

    const handleRestart = async () => {
        if (confirm('¿Estás seguro de que deseas reiniciar este dispositivo?')) {
            await restart(dispositivo.id.toString())
        }
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <GamepadIcon className={styles.headerIcon} />
                    <div>
                        <h3>Control MQTT</h3>
                        <span className={styles.deviceName}>{dispositivo.nombre}</span>
                    </div>
                </div>
            </div>

            {/* Estado de carga */}
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <span>Enviando comando...</span>
                </div>
            )}

            <div className={styles.sections}>
                {/* Control LED */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <LightbulbIcon className={styles.sectionIcon} />
                        <h4>Control de LED</h4>
                    </div>
                    <div className={styles.ledStatus}>
                        Estado: {ledState === null ? '?' : ledState ? '🟢 Encendido' : '⚫ Apagado'}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button
                            onClick={handleLedOn}
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            disabled={loading}
                        >
                            <PowerSettingsNewIcon />
                            <span>Encender</span>
                        </button>
                        <button
                            onClick={handleLedOff}
                            className={`${styles.btn} ${styles.btnDanger}`}
                            disabled={loading}
                        >
                            <PowerSettingsNewIcon />
                            <span>Apagar</span>
                        </button>
                        <button
                            onClick={handleLedToggle}
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            disabled={loading}
                        >
                            <FlashOnIcon />
                            <span>Toggle</span>
                        </button>
                    </div>
                </section>

                {/* Control Dimmer */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <WbSunnyIcon className={styles.sectionIcon} />
                        <h4>Control de Dimmer</h4>
                    </div>
                    <div className={styles.dimmerValue}>{dimmerLevel}%</div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={dimmerLevel}
                        onChange={handleDimmerChange}
                        className={styles.slider}
                        disabled={loading}
                    />
                    <button
                        onClick={handleDimmerSet}
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                        disabled={loading}
                    >
                        <span>Aplicar Nivel</span>
                    </button>
                </section>

                {/* Sensores */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <SensorsIcon className={styles.sectionIcon} />
                        <h4>Sensores</h4>
                    </div>
                    <button
                        onClick={handleReadSensors}
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                        disabled={loading}
                    >
                        <SensorsIcon />
                        <span>Leer Sensores</span>
                    </button>
                </section>

                {/* Sistema */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <SettingsIcon className={styles.sectionIcon} />
                        <h4>Sistema</h4>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button
                            onClick={handleGetStatus}
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            disabled={loading}
                        >
                            <AssessmentIcon />
                            <span>Estado</span>
                        </button>
                        <button
                            onClick={handleRestart}
                            className={`${styles.btn} ${styles.btnDanger}`}
                            disabled={loading}
                        >
                            <RestartAltIcon />
                            <span>Reiniciar</span>
                        </button>
                    </div>
                </section>
            </div>

            {/* Última respuesta */}
            {lastResponse && (
                <div className={styles.lastResponse}>
                    <strong>Última respuesta:</strong>
                    <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

export default MqttControlPanel
