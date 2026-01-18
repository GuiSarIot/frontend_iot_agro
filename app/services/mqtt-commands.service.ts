'use client'

import {
    authenticatedGet,
    authenticatedPost,
} from '@/app/login/services/authenticated-fetch.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ============================================
// INTERFACES - COMANDOS MQTT
// ============================================

/**
 * Parámetros para comando de dimmer
 */
export interface DimmerParams {
    level: number // 0-100
}

/**
 * Parámetros para comandos personalizados
 */
export interface CustomCommandParams {
    [key: string]: unknown
}

/**
 * Comando MQTT disponible
 */
export interface AvailableCommand {
    command: string
    description: string
    params?: {
        [paramName: string]: {
            type: string
            min?: number
            max?: number
            description?: string
            required?: boolean
        }
    }
}

/**
 * Respuesta de comandos disponibles
 */
export interface AvailableCommandsResponse {
    commands: AvailableCommand[]
}

/**
 * Request para enviar comando
 */
export interface SendCommandRequest {
    command: string
    params?: DimmerParams | CustomCommandParams
}

/**
 * Respuesta de envío de comando
 */
export interface SendCommandResponse {
    success: boolean
    message: string
    device_id: string
    command: string
    params?: DimmerParams | CustomCommandParams
}

/**
 * Estado del LED
 */
export interface LedStatus {
    on: boolean
    last_change?: string
}

/**
 * Estado del Dimmer
 */
export interface DimmerStatus {
    level: number // 0-100
    last_change?: string
}

/**
 * Estado completo del dispositivo
 */
export interface DeviceStatus {
    device_id: string
    online: boolean
    led?: LedStatus
    dimmer?: DimmerStatus
    sensors?: {
        [sensorType: string]: {
            value: number
            unit: string
            timestamp: string
        }
    }
    last_seen?: string
}

// ============================================
// SERVICIO - COMANDOS MQTT
// ============================================

/**
 * Servicio para enviar comandos MQTT a dispositivos
 */
export const mqttCommandsService = {
    /**
     * Obtener comandos disponibles
     * GET /api/devices/available-commands/
     */
    getAvailableCommands: async (): Promise<AvailableCommandsResponse> => {
        return authenticatedGet<AvailableCommandsResponse>(
            `${API_BASE_URL}/api/devices/available-commands/`
        )
    },

    /**
     * Enviar comando a un dispositivo
     * POST /api/devices/{device_id}/command/
     * 
     * NOTA: device_id debe ser el ID numérico del dispositivo, no el identificador_unico
     */
    sendCommand: async (
        deviceId: string | number,
        request: SendCommandRequest
    ): Promise<SendCommandResponse> => {
        return authenticatedPost<SendCommandResponse>(
            `${API_BASE_URL}/api/devices/${deviceId}/command/`,
            request
        )
    },

    // ============================================
    // COMANDOS LED
    // ============================================

    /**
     * Encender LED
     */
    ledOn: async (deviceId: string): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command: 'led_on',
        })
    },

    /**
     * Apagar LED
     */
    ledOff: async (deviceId: string): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command: 'led_off',
        })
    },

    /**
     * Alternar estado del LED
     */
    ledToggle: async (deviceId: string): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command: 'led_toggle',
        })
    },

    // ============================================
    // COMANDOS DIMMER
    // ============================================

    /**
     * Ajustar nivel del dimmer
     * @param deviceId ID del dispositivo
     * @param level Nivel del dimmer (0-100)
     */
    dimmerSet: async (deviceId: string, level: number): Promise<SendCommandResponse> => {
        // Validar rango
        if (level < 0 || level > 100) {
            throw new Error('El nivel del dimmer debe estar entre 0 y 100')
        }

        return mqttCommandsService.sendCommand(deviceId, {
            command: 'dimmer_set',
            params: { level },
        })
    },

    // ============================================
    // COMANDOS DE SENSORES
    // ============================================

    /**
     * Solicitar lectura de sensores
     */
    readSensors: async (deviceId: string): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command: 'read_sensors',
        })
    },

    // ============================================
    // COMANDOS DE SISTEMA
    // ============================================

    /**
     * Obtener estado completo del dispositivo
     */
    getStatus: async (deviceId: string): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command: 'get_status',
        })
    },

    /**
     * Reiniciar dispositivo
     */
    restart: async (deviceId: string): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command: 'restart',
        })
    },

    // ============================================
    // COMANDO PERSONALIZADO
    // ============================================

    /**
     * Enviar comando personalizado
     */
    custom: async (
        deviceId: string,
        command: string,
        params?: CustomCommandParams
    ): Promise<SendCommandResponse> => {
        return mqttCommandsService.sendCommand(deviceId, {
            command,
            params,
        })
    },
}

// ============================================
// EXPORTAR
// ============================================

export default mqttCommandsService
