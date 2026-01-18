/**
 * Tipos y constantes para comandos MQTT
 * 
 * Este archivo define tipos reutilizables para trabajar con comandos MQTT
 */

// ============================================
// TIPOS DE COMANDOS
// ============================================

/**
 * Comandos LED disponibles
 */
export const LED_COMMANDS = {
    ON: 'led_on',
    OFF: 'led_off',
    TOGGLE: 'led_toggle',
} as const

export type LedCommand = typeof LED_COMMANDS[keyof typeof LED_COMMANDS]

/**
 * Comandos de Dimmer disponibles
 */
export const DIMMER_COMMANDS = {
    SET: 'dimmer_set',
} as const

export type DimmerCommand = typeof DIMMER_COMMANDS[keyof typeof DIMMER_COMMANDS]

/**
 * Comandos de Sensores disponibles
 */
export const SENSOR_COMMANDS = {
    READ: 'read_sensors',
} as const

export type SensorCommand = typeof SENSOR_COMMANDS[keyof typeof SENSOR_COMMANDS]

/**
 * Comandos de Sistema disponibles
 */
export const SYSTEM_COMMANDS = {
    GET_STATUS: 'get_status',
    RESTART: 'restart',
} as const

export type SystemCommand = typeof SYSTEM_COMMANDS[keyof typeof SYSTEM_COMMANDS]

/**
 * Todos los comandos disponibles
 */
export type MqttCommand = 
    | LedCommand 
    | DimmerCommand 
    | SensorCommand 
    | SystemCommand
    | string // Permitir comandos personalizados

// ============================================
// CONSTANTES
// ============================================

/**
 * Rango válido para el dimmer
 */
export const DIMMER_RANGE = {
    MIN: 0,
    MAX: 100,
} as const

/**
 * Tópicos MQTT por tipo de comando
 */
export const MQTT_TOPICS = {
    COMMANDS: (deviceId: string) => `iot/devices/${deviceId}/commands`,
    STATUS: (deviceId: string) => `iot/devices/${deviceId}/status`,
    SENSORS: (deviceId: string) => `iot/devices/${deviceId}/sensors`,
    TELEMETRY: (deviceId: string) => `iot/devices/${deviceId}/telemetry`,
} as const

/**
 * QoS (Quality of Service) levels
 */
export const QOS_LEVELS = {
    AT_MOST_ONCE: 0,
    AT_LEAST_ONCE: 1,
    EXACTLY_ONCE: 2,
} as const

export type QosLevel = typeof QOS_LEVELS[keyof typeof QOS_LEVELS]

// ============================================
// UTILIDADES
// ============================================

/**
 * Validar nivel de dimmer
 */
export function isValidDimmerLevel(level: number): boolean {
    return level >= DIMMER_RANGE.MIN && level <= DIMMER_RANGE.MAX && Number.isInteger(level)
}

/**
 * Validar comando LED
 */
export function isLedCommand(command: string): command is LedCommand {
    return Object.values(LED_COMMANDS).includes(command as LedCommand)
}

/**
 * Validar comando de dimmer
 */
export function isDimmerCommand(command: string): command is DimmerCommand {
    return Object.values(DIMMER_COMMANDS).includes(command as DimmerCommand)
}

/**
 * Validar comando de sensor
 */
export function isSensorCommand(command: string): command is SensorCommand {
    return Object.values(SENSOR_COMMANDS).includes(command as SensorCommand)
}

/**
 * Validar comando de sistema
 */
export function isSystemCommand(command: string): command is SystemCommand {
    return Object.values(SYSTEM_COMMANDS).includes(command as SystemCommand)
}

/**
 * Obtener descripción del comando
 */
export function getCommandDescription(command: MqttCommand): string {
    const descriptions: Record<string, string> = {
        [LED_COMMANDS.ON]: 'Encender LED',
        [LED_COMMANDS.OFF]: 'Apagar LED',
        [LED_COMMANDS.TOGGLE]: 'Alternar estado del LED',
        [DIMMER_COMMANDS.SET]: 'Ajustar nivel del dimmer',
        [SENSOR_COMMANDS.READ]: 'Solicitar lectura de sensores',
        [SYSTEM_COMMANDS.GET_STATUS]: 'Obtener estado completo del dispositivo',
        [SYSTEM_COMMANDS.RESTART]: 'Reiniciar dispositivo',
    }
    
    return descriptions[command] || 'Comando personalizado'
}

/**
 * Obtener icono del comando
 */
export function getCommandIcon(command: MqttCommand): string {
    const icons: Record<string, string> = {
        [LED_COMMANDS.ON]: '💡',
        [LED_COMMANDS.OFF]: '⚫',
        [LED_COMMANDS.TOGGLE]: '⚡',
        [DIMMER_COMMANDS.SET]: '🔆',
        [SENSOR_COMMANDS.READ]: '📊',
        [SYSTEM_COMMANDS.GET_STATUS]: '📋',
        [SYSTEM_COMMANDS.RESTART]: '🔄',
    }
    
    return icons[command] || '⚙️'
}

// ============================================
// TIPOS DE RESPUESTA
// ============================================

/**
 * Estado de ejecución del comando
 */
export type CommandStatus = 'pending' | 'sent' | 'delivered' | 'executed' | 'failed'

/**
 * Historial de comando
 */
export interface CommandHistory {
    id: string
    deviceId: string
    command: MqttCommand
    params?: Record<string, unknown>
    status: CommandStatus
    timestamp: Date
    response?: unknown
    error?: string
}

// ============================================
// TIPOS DE EVENTOS
// ============================================

/**
 * Evento de comando enviado
 */
export interface CommandSentEvent {
    deviceId: string
    command: MqttCommand
    params?: Record<string, unknown>
    timestamp: Date
}

/**
 * Evento de respuesta recibida
 */
export interface CommandResponseEvent {
    deviceId: string
    command: MqttCommand
    success: boolean
    message: string
    data?: unknown
    timestamp: Date
}

/**
 * Evento de error
 */
export interface CommandErrorEvent {
    deviceId: string
    command: MqttCommand
    error: string
    timestamp: Date
}

// ============================================
// EXPORTAR TODOS LOS TIPOS
// ============================================

const mqttCommandsModule = {
    LED_COMMANDS,
    DIMMER_COMMANDS,
    SENSOR_COMMANDS,
    SYSTEM_COMMANDS,
    DIMMER_RANGE,
    MQTT_TOPICS,
    QOS_LEVELS,
    isValidDimmerLevel,
    isLedCommand,
    isDimmerCommand,
    isSensorCommand,
    isSystemCommand,
    getCommandDescription,
    getCommandIcon,
}

export default mqttCommandsModule
