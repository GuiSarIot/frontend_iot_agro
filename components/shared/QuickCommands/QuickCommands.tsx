'use client'

import { useMqttCommands } from '@/app/hooks/useMqttCommands'
import { 
    LED_COMMANDS, 
    SENSOR_COMMANDS,
    SYSTEM_COMMANDS,
    getCommandIcon,
    getCommandDescription
} from '@/app/services/mqtt-commands.types'

import styles from './QuickCommands.module.css'

/**
 * Props del componente
 */
interface QuickCommandsProps {
    deviceId: string
    showLed?: boolean
    showDimmer?: boolean
    showSensors?: boolean
    showSystem?: boolean
    compact?: boolean
}

/**
 * Componente de comandos rápidos MQTT
 * 
 * Muestra botones para ejecutar comandos comunes de forma rápida
 * 
 * @example
 * ```tsx
 * <QuickCommands 
 *   deviceId="device-001"
 *   showLed={true}
 *   showSensors={true}
 * />
 * ```
 */
export function QuickCommands({
    deviceId,
    showLed = true,
    showDimmer = true,
    showSensors = true,
    showSystem = false,
    compact = false,
}: QuickCommandsProps) {
    const {
        ledOn,
        ledOff,
        ledToggle,
        dimmerSet,
        readSensors,
        getStatus,
        restart,
        loading,
    } = useMqttCommands()

    const quickCommands = [
        // LED
        ...(showLed ? [
            {
                label: compact ? 'LED ON' : 'Encender LED',
                icon: getCommandIcon(LED_COMMANDS.ON),
                action: () => ledOn(deviceId),
                color: 'success',
            },
            {
                label: compact ? 'LED OFF' : 'Apagar LED',
                icon: getCommandIcon(LED_COMMANDS.OFF),
                action: () => ledOff(deviceId),
                color: 'danger',
            },
            {
                label: compact ? 'Toggle' : 'Toggle LED',
                icon: getCommandIcon(LED_COMMANDS.TOGGLE),
                action: () => ledToggle(deviceId),
                color: 'primary',
            },
        ] : []),

        // Dimmer
        ...(showDimmer ? [
            {
                label: '0%',
                icon: '🌑',
                action: () => dimmerSet(deviceId, 0),
                color: 'secondary',
            },
            {
                label: '50%',
                icon: '🌗',
                action: () => dimmerSet(deviceId, 50),
                color: 'secondary',
            },
            {
                label: '100%',
                icon: '🌕',
                action: () => dimmerSet(deviceId, 100),
                color: 'secondary',
            },
        ] : []),

        // Sensores
        ...(showSensors ? [
            {
                label: compact ? 'Leer' : 'Leer Sensores',
                icon: getCommandIcon(SENSOR_COMMANDS.READ),
                action: () => readSensors(deviceId),
                color: 'primary',
            },
        ] : []),

        // Sistema
        ...(showSystem ? [
            {
                label: compact ? 'Estado' : 'Estado del Sistema',
                icon: getCommandIcon(SYSTEM_COMMANDS.GET_STATUS),
                action: () => getStatus(deviceId),
                color: 'secondary',
            },
            {
                label: compact ? 'Reiniciar' : 'Reiniciar Dispositivo',
                icon: getCommandIcon(SYSTEM_COMMANDS.RESTART),
                action: () => restart(deviceId),
                color: 'danger',
            },
        ] : []),
    ]

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            {quickCommands.map((cmd, index) => (
                <button
                    key={index}
                    onClick={cmd.action}
                    disabled={loading}
                    className={`${styles.button} ${styles[cmd.color]}`}
                    title={getCommandDescription(cmd.label)}
                >
                    <span className={styles.icon}>{cmd.icon}</span>
                    {!compact && <span className={styles.label}>{cmd.label}</span>}
                </button>
            ))}
        </div>
    )
}

export default QuickCommands
