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
    ph?: number
    tds?: number  // TDS en ppm
    timestamp?: string
    device_id?: string
    // Metadatos adicionales
    ph_voltage?: number
    ph_adc?: number
    ph_model?: string
    tds_voltage?: number
    tds_adc?: number
    tds_model?: string
    temperature_unit?: string
    temperature_model?: string
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
                ph: 6.5 + Math.random() * 1.5,        // 6.5-8.0 pH
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

            console.log('🔌 Conectando al broker MQTT:', {
                url: brokerUrl,
                deviceId,
                username: credentialsRef.current.username,
                clientId: `frontend_${deviceId}_${Date.now()}`
            })

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
                console.log('✅ Conectado al broker MQTT')
                setConnectionStatus('connected')
                setError(null)

                // Suscribirse al tópico de sensores del dispositivo (coincide con permisos ACL)
                const topic = `iot/sensors/${deviceId}/#`
                console.log('📡 Suscribiéndose al topic:', topic)
                client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ Error suscribiéndose a ${topic}:`, err)
                        setError(`Error suscribiéndose al tópico: ${err.message}`)
                    } else {
                        console.log(`✅ Suscrito exitosamente a: ${topic}`)
                    }
                })
            })

            // Event: Mensaje recibido
            client.on('message', (topic, message) => {
                try {
                    const payload = JSON.parse(message.toString())
                    
                    console.log('📥 Mensaje MQTT recibido:', topic, payload)
                    console.log('🔍 Verificando formato:', {
                        hasType: 'type' in payload,
                        typeValue: payload.type,
                        hasSensors: 'sensors' in payload,
                        hasSensorReadings: 'sensor_readings' in payload,
                        isArray: Array.isArray(payload.sensors) || Array.isArray(payload.sensor_readings),
                        sensorsLength: payload.sensors?.length || payload.sensor_readings?.length
                    })

                    // Soportar múltiples formatos de payload:
                    // Formato 1: Backend con readings { ph: { value: 7.13 } }
                    // Formato 2: Backend con sensor_reading (singular) { ph: 7.13, ... }
                    // Formato 3: Directo del Raspberry { ph: 7.13, temperature: 25.5 }
                    // Formato 4: Multi-sensor { type: "multi_sensor", sensors: [{sensor_type: "ph", ph: 10.01, ...}] }
                    // Formato 5: Backend con sensor_readings (array) { sensor_readings: [{type: "ph_sensor", ph_value: 7.13, ...}] }
                    
                    let sensorValues: SensorData = {}
                    let isMultiSensor = false
                    
                    // Formato 5: sensor_readings array (nuevo formato del backend)
                    if (payload.sensor_readings && Array.isArray(payload.sensor_readings)) {
                        isMultiSensor = true
                        console.log('📡 Formato sensor_readings detectado, parseando sensores...')
                        
                        payload.sensor_readings.forEach((sensor: any) => {
                            const sensorType = sensor.type
                            
                            switch (sensorType) {
                                case 'ph_sensor':
                                    sensorValues.ph = sensor.ph_value !== undefined ? Number(sensor.ph_value) : 
                                        sensor.ph !== undefined ? Number(sensor.ph) : undefined
                                    sensorValues.ph_voltage = sensor.voltage !== undefined ? Number(sensor.voltage) : undefined
                                    sensorValues.ph_adc = sensor.adc !== undefined ? Number(sensor.adc) : undefined
                                    sensorValues.ph_model = sensor.model
                                    console.log(`  ✓ pH: ${sensorValues.ph} | V: ${sensorValues.ph_voltage}V | ADC: ${sensorValues.ph_adc} | Model: ${sensorValues.ph_model}`)
                                    break
                                    
                                case 'tds_sensor':
                                    sensorValues.tds = sensor.tds_ppm !== undefined ? Number(sensor.tds_ppm) : 
                                        sensor.tds !== undefined ? Number(sensor.tds) : undefined
                                    sensorValues.tds_voltage = sensor.voltage !== undefined ? Number(sensor.voltage) : undefined
                                    sensorValues.tds_adc = sensor.adc !== undefined ? Number(sensor.adc) : undefined
                                    sensorValues.tds_model = sensor.model
                                    console.log(`  ✓ TDS: ${sensorValues.tds} ppm | V: ${sensorValues.tds_voltage}V | ADC: ${sensorValues.tds_adc} | Model: ${sensorValues.tds_model}`)
                                    break
                                    
                                case 'temperature_sensor':
                                    sensorValues.temperature = sensor.temperature !== undefined ? Number(sensor.temperature) : undefined
                                    sensorValues.temperature_unit = sensor.unit
                                    sensorValues.temperature_model = sensor.model
                                    console.log(`  ✓ Temp: ${sensorValues.temperature}${sensor.unit || '°C'} | Model: ${sensorValues.temperature_model}`)
                                    break
                                    
                                case 'humidity_sensor':
                                    sensorValues.humidity = sensor.humidity !== undefined ? Number(sensor.humidity) : undefined
                                    console.log(`  ✓ Humidity: ${sensorValues.humidity}%`)
                                    break
                                    
                                case 'pressure_sensor':
                                    sensorValues.pressure = sensor.pressure !== undefined ? Number(sensor.pressure) : undefined
                                    console.log(`  ✓ Pressure: ${sensorValues.pressure} hPa`)
                                    break
                                    
                                case 'light_sensor':
                                    sensorValues.light = sensor.light !== undefined ? Number(sensor.light) : undefined
                                    console.log(`  ✓ Light: ${sensorValues.light} lux`)
                                    break
                                    
                                default:
                                    console.warn(`  ⚠️ Tipo de sensor desconocido: ${sensorType}`)
                            }
                        })
                    }
                    // Formato 4: multi_sensor con sensors array (formato anterior)
                    else if (payload.type === 'multi_sensor' && payload.sensors && Array.isArray(payload.sensors)) {
                        // Formato 4: multi_sensor - iterar sobre array de sensores
                        isMultiSensor = true
                        console.log('📡 Formato multi_sensor detectado, parseando sensores...')
                        
                        payload.sensors.forEach((sensor: any) => {
                            const sensorType = sensor.sensor_type
                            
                            switch (sensorType) {
                                case 'ph':
                                    sensorValues.ph = sensor.ph !== undefined ? Number(sensor.ph) : undefined
                                    sensorValues.ph_voltage = sensor.voltage !== undefined ? Number(sensor.voltage) : undefined
                                    sensorValues.ph_adc = sensor.adc !== undefined ? Number(sensor.adc) : undefined
                                    sensorValues.ph_model = sensor.model
                                    console.log(`  ✓ pH: ${sensorValues.ph} | V: ${sensorValues.ph_voltage}V | ADC: ${sensorValues.ph_adc}`)
                                    break
                                    
                                case 'tds':
                                    sensorValues.tds = sensor.tds_ppm !== undefined ? Number(sensor.tds_ppm) : undefined
                                    sensorValues.tds_voltage = sensor.voltage !== undefined ? Number(sensor.voltage) : undefined
                                    sensorValues.tds_adc = sensor.adc !== undefined ? Number(sensor.adc) : undefined
                                    sensorValues.tds_model = sensor.model
                                    console.log(`  ✓ TDS: ${sensorValues.tds} ppm | V: ${sensorValues.tds_voltage}V | ADC: ${sensorValues.tds_adc}`)
                                    break
                                    
                                case 'temperature':
                                    sensorValues.temperature = sensor.temperature !== undefined ? Number(sensor.temperature) : undefined
                                    sensorValues.temperature_unit = sensor.unit
                                    sensorValues.temperature_model = sensor.model
                                    console.log(`  ✓ Temp: ${sensorValues.temperature}${sensor.unit || '°C'}`)
                                    break
                                    
                                case 'humidity':
                                    sensorValues.humidity = sensor.humidity !== undefined ? Number(sensor.humidity) : undefined
                                    break
                                    
                                case 'pressure':
                                    sensorValues.pressure = sensor.pressure !== undefined ? Number(sensor.pressure) : undefined
                                    break
                                    
                                case 'light':
                                    sensorValues.light = sensor.light !== undefined ? Number(sensor.light) : undefined
                                    break
                                    
                                default:
                                    console.warn(`  ⚠️ Tipo de sensor desconocido: ${sensorType}`)
                            }
                        })
                    } else if (payload.readings) {
                        // Formato 1: backend con readings (plural) - extraer .value de cada sensor
                        const readings = payload.readings
                        sensorValues = {
                            temperature: readings.temperature?.value !== undefined ? Number(readings.temperature.value) : undefined,
                            humidity: readings.humidity?.value !== undefined ? Number(readings.humidity.value) : undefined,
                            pressure: readings.pressure?.value !== undefined ? Number(readings.pressure.value) : undefined,
                            light: readings.light?.value !== undefined ? Number(readings.light.value) : undefined,
                            ph: readings.ph?.value !== undefined ? Number(readings.ph.value) : undefined,
                            tds: readings.tds?.value !== undefined ? Number(readings.tds.value) : undefined,
                        }
                    } else if (payload.sensor_reading) {
                        // Formato 2: backend con sensor_reading (singular)
                        // Busca valores con sufijos: ph_value, temperature_value, etc.
                        const reading = payload.sensor_reading
                        console.log('🔍 Contenido de sensor_reading:', reading)
                        
                        sensorValues = {
                            temperature: reading.temperature_value !== undefined ? Number(reading.temperature_value) : 
                                reading.temperature !== undefined ? Number(reading.temperature) : 
                                    reading.temperature_c !== undefined ? Number(reading.temperature_c) : undefined,
                            humidity: reading.humidity_value !== undefined ? Number(reading.humidity_value) : 
                                reading.humidity !== undefined ? Number(reading.humidity) : undefined,
                            pressure: reading.pressure_value !== undefined ? Number(reading.pressure_value) : 
                                reading.pressure !== undefined ? Number(reading.pressure) : undefined,
                            light: reading.light_value !== undefined ? Number(reading.light_value) : 
                                reading.light !== undefined ? Number(reading.light) : undefined,
                            ph: reading.ph_value !== undefined ? Number(reading.ph_value) : 
                                reading.ph !== undefined ? Number(reading.ph) : undefined,
                            tds: reading.tds_value !== undefined ? Number(reading.tds_value) : 
                                reading.tds !== undefined ? Number(reading.tds) : 
                                    reading.tds_ppm !== undefined ? Number(reading.tds_ppm) : undefined,
                            // Metadatos adicionales
                            temperature_unit: reading.unit,
                            temperature_model: reading.model,
                            ph_voltage: reading.voltage,
                            ph_adc: reading.adc,
                            ph_model: reading.model,
                        }
                        
                        console.log('✅ Valores parseados de sensor_reading:', sensorValues)
                    } else {
                        // Formato 3: directo del Raspberry - valores en el nivel raíz
                        sensorValues = {
                            temperature: payload.temperature !== undefined ? Number(payload.temperature) : undefined,
                            humidity: payload.humidity !== undefined ? Number(payload.humidity) : undefined,
                            pressure: payload.pressure !== undefined ? Number(payload.pressure) : undefined,
                            light: payload.light !== undefined ? Number(payload.light) : undefined,
                            ph: payload.ph !== undefined ? Number(payload.ph) : undefined,
                            tds: payload.tds !== undefined ? Number(payload.tds) : 
                                payload.tds_ppm !== undefined ? Number(payload.tds_ppm) : undefined,
                        }
                    }
                    
                    // Actualizar datos de sensores
                    if (isMultiSensor) {
                        // Multi-sensor: reemplazar completamente con los nuevos datos
                        // Convertir timestamp de millis del dispositivo a ISO string
                        const timestampValue = payload.timestamp 
                            ? (typeof payload.timestamp === 'number' 
                                ? new Date().toISOString() // Usar timestamp actual ya que el del dispositivo es relativo
                                : payload.timestamp)
                            : new Date().toISOString()
                        
                        const updatedData = {
                            ...sensorValues,
                            timestamp: timestampValue,
                            device_id: payload.device_id || deviceId,
                        }
                        
                        setSensorData(updatedData)
                        console.log('✅ Datos multi-sensor actualizados (reemplazo completo):', updatedData)
                        console.log('📊 Valores finales:', {
                            ph: updatedData.ph,
                            tds: updatedData.tds,
                            temperature: updatedData.temperature,
                            timestamp: updatedData.timestamp
                        })
                    } else {
                        // Otros formatos: acumular valores (mantener valores previos)
                        setSensorData(prev => ({
                            ...prev,
                            ...Object.fromEntries(
                                Object.entries(sensorValues).filter(([_, v]) => v !== undefined)
                            ),
                            timestamp: payload.timestamp || new Date().toISOString(),
                            device_id: payload.device_id || deviceId,
                        }))
                        console.log('✅ Datos de sensores actualizados (acumulados):', sensorValues)
                    }
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
