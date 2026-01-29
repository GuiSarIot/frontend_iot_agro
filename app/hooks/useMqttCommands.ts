'use client'

import { useState, useCallback } from 'react'
import { mqttCommandsService } from '@/app/services/mqtt-commands.service'
import type {
    SendCommandResponse,
    AvailableCommand,
} from '@/app/services/mqtt-commands.service'

/**
 * Estado del hook
 */
interface UseMqttCommandsState {
    loading: boolean
    error: string | null
    lastResponse: SendCommandResponse | null
}

/**
 * Resultado del hook
 */
interface UseMqttCommandsResult extends UseMqttCommandsState {
    // Comandos LED
    ledOn: (deviceId: string) => Promise<SendCommandResponse | null>
    ledOff: (deviceId: string) => Promise<SendCommandResponse | null>
    ledToggle: (deviceId: string) => Promise<SendCommandResponse | null>
    
    // Comandos Relays
    relay1On: (deviceId: string) => Promise<SendCommandResponse | null>
    relay1Off: (deviceId: string) => Promise<SendCommandResponse | null>
    relay2On: (deviceId: string) => Promise<SendCommandResponse | null>
    relay2Off: (deviceId: string) => Promise<SendCommandResponse | null>
    relayBothOn: (deviceId: string) => Promise<SendCommandResponse | null>
    relayBothOff: (deviceId: string) => Promise<SendCommandResponse | null>
    
    // Comandos Dimmer
    dimmerSet: (deviceId: string, level: number) => Promise<SendCommandResponse | null>
    
    // Comandos Sensores
    readSensors: (deviceId: string) => Promise<SendCommandResponse | null>
    
    // Comandos Sistema
    getStatus: (deviceId: string) => Promise<SendCommandResponse | null>
    restart: (deviceId: string) => Promise<SendCommandResponse | null>
    
    // Comando personalizado
    sendCustomCommand: (
        deviceId: string,
        command: string,
        params?: Record<string, unknown>
    ) => Promise<SendCommandResponse | null>
    
    // Obtener comandos disponibles
    getAvailableCommands: () => Promise<AvailableCommand[]>
    
    // Limpiar error
    clearError: () => void
}

/**
 * Hook para enviar comandos MQTT a dispositivos
 * 
 * @example
 * ```tsx
 * const { ledOn, ledOff, dimmerSet, loading, error } = useMqttCommands()
 * 
 * const handleLedOn = async () => {
 *   await ledOn('device-001')
 * }
 * 
 * const handleDimmer = async (level: number) => {
 *   await dimmerSet('device-001', level)
 * }
 * ```
 */
export function useMqttCommands(): UseMqttCommandsResult {
    const [state, setState] = useState<UseMqttCommandsState>({
        loading: false,
        error: null,
        lastResponse: null,
    })

    /**
     * Wrapper genérico para ejecutar comandos
     */
    const executeCommand = useCallback(
        async <T,>(
            commandFn: () => Promise<T>
        ): Promise<T | null> => {
            setState(prev => ({ ...prev, loading: true, error: null }))

            try {
                const response = await commandFn()
                setState(prev => ({
                    ...prev,
                    loading: false,
                    lastResponse: response as unknown as SendCommandResponse,
                }))
                return response
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                }))
                console.error('Error ejecutando comando MQTT:', err)
                return null
            }
        },
        []
    )

    // ============================================
    // COMANDOS LED
    // ============================================

    const ledOn = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.ledOn(deviceId))
        },
        [executeCommand]
    )

    const ledOff = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.ledOff(deviceId))
        },
        [executeCommand]
    )

    const ledToggle = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.ledToggle(deviceId))
        },
        [executeCommand]
    )

    // ============================================
    // COMANDOS RELAYS
    // ============================================

    const relay1On = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.relay1On(deviceId))
        },
        [executeCommand]
    )

    const relay1Off = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.relay1Off(deviceId))
        },
        [executeCommand]
    )

    const relay2On = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.relay2On(deviceId))
        },
        [executeCommand]
    )

    const relay2Off = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.relay2Off(deviceId))
        },
        [executeCommand]
    )

    const relayBothOn = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.relayBothOn(deviceId))
        },
        [executeCommand]
    )

    const relayBothOff = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.relayBothOff(deviceId))
        },
        [executeCommand]
    )

    // ============================================
    // COMANDOS DIMMER
    // ============================================

    const dimmerSet = useCallback(
        (deviceId: string, level: number) => {
            return executeCommand(() => mqttCommandsService.dimmerSet(deviceId, level))
        },
        [executeCommand]
    )

    // ============================================
    // COMANDOS SENSORES
    // ============================================

    const readSensors = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.readSensors(deviceId))
        },
        [executeCommand]
    )

    // ============================================
    // COMANDOS SISTEMA
    // ============================================

    const getStatus = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.getStatus(deviceId))
        },
        [executeCommand]
    )

    const restart = useCallback(
        (deviceId: string) => {
            return executeCommand(() => mqttCommandsService.restart(deviceId))
        },
        [executeCommand]
    )

    // ============================================
    // COMANDO PERSONALIZADO
    // ============================================

    const sendCustomCommand = useCallback(
        (deviceId: string, command: string, params?: Record<string, unknown>) => {
            return executeCommand(() => mqttCommandsService.custom(deviceId, command, params))
        },
        [executeCommand]
    )

    // ============================================
    // COMANDOS DISPONIBLES
    // ============================================

    const getAvailableCommands = useCallback(async (): Promise<AvailableCommand[]> => {
        try {
            const response = await mqttCommandsService.getAvailableCommands()
            return response.commands
        } catch (err) {
            console.error('Error obteniendo comandos disponibles:', err)
            return []
        }
    }, [])

    // ============================================
    // UTILIDADES
    // ============================================

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    return {
        // Estado
        loading: state.loading,
        error: state.error,
        lastResponse: state.lastResponse,

        // Comandos LED
        ledOn,
        ledOff,
        ledToggle,

        // Comandos Relays
        relay1On,
        relay1Off,
        relay2On,
        relay2Off,
        relayBothOn,
        relayBothOff,

        // Comandos Dimmer
        dimmerSet,

        // Comandos Sensores
        readSensors,

        // Comandos Sistema
        getStatus,
        restart,

        // Comando personalizado
        sendCustomCommand,

        // Comandos disponibles
        getAvailableCommands,

        // Utilidades
        clearError,
    }
}

export default useMqttCommands
