'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import mqtt from 'mqtt'

import type { MqttClient } from 'mqtt'

/**
 * Datos de sensores recibidos vía MQTT
 */
export interface SensorData {
    temperature?: number
    humidity?: number
    pressure?: number
    light?: number
    timestamp?: string
    device_id?: string
}

/**
 * Estado de la conexión MQTT
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Credenciales MQTT del dispositivo
 */
export interface MqttCredentials {
    username: string
    password: string
    broker_host?: string
    broker_port?: number
}

/**
 * Resultado del hook
 */
interface UseMqttSubscriptionResult {
    sensorData: SensorData | null
    connectionStatus: ConnectionStatus
    error: string | null
    isConnected: boolean
    reconnect: () => void
}

/**
 * Hook para suscribirse a mensajes MQTT del broker EMQX
 * 
 * Se conecta DIRECTAMENTE al broker EMQX vía WebSocket MQTT (puerto 8083)
 * Usa las credenciales MQTT específicas del dispositivo
 * 
 * @param deviceId - ID del dispositivo a escuchar
 * @param credentials - Credenciales MQTT del dispositivo (username/password)
 * @param autoConnect - Conectar automáticamente (default: true)
 * @param enableMockData - Habilitar datos simulados para desarrollo (default: false)
 * 
 * @example
 * ```tsx
 * const { sensorData, isConnected } = useMqttSubscription(
 *   'test001',
 *   { username: 'test001', password: 'device_password' }
 * )
 * ```
 */
export function useMqttSubscription(
    deviceId?: string,
    credentials?: MqttCredentials,
    autoConnect: boolean = true,
    enableMockData: boolean = false
): UseMqttSubscriptionResult {
    const [sensorData, setSensorData] = useState<SensorData | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
    const [error, setError] = useState<string | null>(null)
    
    const clientRef = useRef<MqttClient | null>(null)
    const mockIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const credentialsRef = useRef<MqttCredentials | undefined>(credentials)
    const connectRef = useRef<(() => void) | null>(null)
    const stopMockDataRef = useRef<(() => void) | null>(null)
    
    // Update refs when values change
    useEffect(() => {
        credentialsRef.current = credentials
    }, [credentials])

    /**
     * Generar datos simulados para desarrollo
     */
    const startMockData = useCallback(() => {
        setConnectionStatus('connected')
        setError(null)

        const updateMockData = () => {
            const mockData: SensorData = {
                temperature: 20 + Math.random() * 15, // 20-35°C
                humidity: 30 + Math.random() * 40,    // 30-70%
                pressure: 1000 + Math.random() * 20,  // 1000-1020 hPa
                light: Math.random() * 100,           // 0-100 lux
                timestamp: new Date().toISOString(),
                device_id: deviceId || 'mock-device',
            }
            setSensorData(mockData)
        }

        // Actualizar cada 3 segundos
        updateMockData()
        mockIntervalRef.current = setInterval(updateMockData, 3000)
    }, [deviceId])

    /**
     * Detener datos simulados
     */
    const stopMockData = useCallback(() => {
        if (mockIntervalRef.current) {
            clearInterval(mockIntervalRef.current)
            mockIntervalRef.current = undefined
        }
        setConnectionStatus('disconnected')
    }, [])
    
    stopMockDataRef.current = stopMockData

    /**
     * Conectar al broker EMQX vía WebSocket MQTT
     */
    const connect = useCallback(() => {
        // Si está habilitado el modo mock, usar datos simulados
        if (enableMockData) {
            startMockData()
            return
        }

        // Limpiar conexión existente
        if (clientRef.current) {
            clientRef.current.end()
            clientRef.current = null
        }

        if (!deviceId) {
            console.warn('⚠️ No se especificó deviceId, no se puede suscribir a tópicos')
            return
        }

        if (!credentialsRef.current) {
            console.warn('⚠️ No se especificaron credenciales MQTT del dispositivo')
            setError('Credenciales MQTT no disponibles')
            return
        }

        setConnectionStatus('connecting')
        setError(null)

        try {
            // Configuración de conexión a EMQX usando credenciales del dispositivo
            const brokerHost = credentialsRef.current.broker_host || '158.247.123.43'
            // IMPORTANTE: Usar puerto 8083 para WebSocket MQTT (el backend devuelve 1883 que es para MQTT estándar)
            const brokerPort = 8083
            const brokerUrl = `ws://${brokerHost}:${brokerPort}/mqtt`

            // Crear cliente MQTT con las credenciales del dispositivo
            const client = mqtt.connect(brokerUrl, {
                clientId: `frontend_${deviceId}_${Date.now()}`,
                username: credentialsRef.current.username,
                password: credentialsRef.current.password,
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30000,
            })

            clientRef.current = client

            // Event: Conexión exitosa
            client.on('connect', () => {
                setConnectionStatus('connected')
                setError(null)

                // Suscribirse al tópico de sensores del dispositivo (coincide con permisos ACL)
                const topic = `iot/sensors/${deviceId}/#`
                client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ Error suscribiéndose a ${topic}:`, err)
                        setError(`Error suscribiéndose al tópico: ${err.message}`)
                    }
                })
            })

            // Event: Mensaje recibido
            client.on('message', (topic, message) => {
                try {
                    const payload = JSON.parse(message.toString())

                    // El backend envía los datos dentro de payload.readings
                    // Cada sensor tiene { value, unit, timestamp }
                    const readings = payload.readings || {}
                    
                    // Actualizar datos de sensores (extraer .value de cada sensor)
                    setSensorData({
                        temperature: readings.temperature?.value !== undefined ? Number(readings.temperature.value) : undefined,
                        humidity: readings.humidity?.value !== undefined ? Number(readings.humidity.value) : undefined,
                        pressure: readings.pressure?.value !== undefined ? Number(readings.pressure.value) : undefined,
                        light: readings.light?.value !== undefined ? Number(readings.light.value) : undefined,
                        timestamp: payload.timestamp || new Date().toISOString(),
                        device_id: payload.device_id || deviceId,
                    })
                } catch (err) {
                    console.error('❌ Error parseando mensaje MQTT:', err)
                }
            })

            // Event: Error
            client.on('error', (err) => {
                console.error('❌ Error en conexión MQTT:', err)
                setConnectionStatus('error')
                setError(err.message || 'Error desconocido en conexión MQTT')
            })

            // Event: Desconectado
            client.on('close', () => {
                setConnectionStatus('disconnected')
            })

            // Event: Reconexión
            client.on('reconnect', () => {
                setConnectionStatus('connecting')
            })

        } catch (err) {
            console.error('❌ Error creando cliente MQTT:', err)
            setConnectionStatus('error')
            setError(err instanceof Error ? err.message : 'Error desconocido')
        }
    }, [deviceId, enableMockData, startMockData])
    
    connectRef.current = connect

    /**
     * Desconectar del broker MQTT
     */
    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.end(true) // force = true para desconexión inmediata
            clientRef.current = null
        }

        stopMockData()
        
        setConnectionStatus('disconnected')
    }, [stopMockData])

    /**
     * Reconectar manualmente
     */
    const reconnect = useCallback(() => {
        disconnect()
        setTimeout(() => connect(), 500)
    }, [connect, disconnect])

    // Conectar al montar el componente
    useEffect(() => {
        if (autoConnect && deviceId && credentialsRef.current) {
            connectRef.current?.()
        }

        // Cleanup al desmontar - solo disconnect, no las funciones
        return () => {
            if (clientRef.current) {
                clientRef.current.end(true)
                clientRef.current = null
            }
            stopMockDataRef.current?.()
        }
    }, [autoConnect, deviceId])

    return {
        sensorData,
        connectionStatus,
        error,
        isConnected: connectionStatus === 'connected',
        reconnect,
    }
}

export default useMqttSubscription
