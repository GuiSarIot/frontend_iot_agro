'use client'

import {
    authenticatedGet,
    authenticatedPost,
    authenticatedPut,
    authenticatedPatch,
    authenticatedDelete,
} from '@/app/login/services/authenticated-fetch.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ============================================
// INTERFACES - DISPOSITIVOS
// ============================================

/**
 * Detalle de sensor asignado a un dispositivo
 */
export interface SensorAsignado {
    id: number
    sensor: number
    sensor_nombre: string
    sensor_detail?: {
        id: number
        nombre: string
        tipo: string
        tipo_display: string
        unidad_medida: string
        rango_min?: number
        rango_max?: number
        descripcion?: string
    }
    configuracion_json: {
        intervalo?: number
        umbral_alerta?: number
        [key: string]: unknown
    }
    activo: boolean
    fecha_asignacion: string
}

/**
 * Tipo de dispositivo
 */
export interface TipoDispositivo {
    value: string
    label: string
}

/**
 * Dispositivo completo
 */
export interface Dispositivo {
    id: number
    nombre: string
    tipo: string
    tipo_display: string
    identificador_unico: string
    ubicacion: string
    estado: string
    estado_display: string
    descripcion: string
    operador_asignado: number | null
    operador_username?: string
    mqtt_enabled?: boolean
    mqtt_client_id?: string
    connection_status?: string
    last_seen?: string
    sensores_asignados: SensorAsignado[]
    cantidad_sensores: number
    created_at: string
    updated_at?: string
}

/**
 * Response paginada de dispositivos
 */
export interface DispositivosResponse {
    count: number
    next: string | null
    previous: string | null
    results: Dispositivo[]
}

/**
 * Datos para crear/actualizar dispositivo
 */
export interface CreateDispositivoDto {
    nombre: string
    tipo: string
    identificador_unico: string
    ubicacion: string
    estado?: string
    descripcion?: string
    operador_asignado?: number | null
}

/**
 * Parámetros de búsqueda
 */
export interface DispositivoQueryParams {
    search?: string
    tipo?: string
    estado?: string
    operador?: number
    page?: number
    page_size?: number
}

/**
 * Datos para asignar sensor
 */
export interface AsignarSensorDto {
    sensor_id: number
    configuracion_json?: {
        intervalo?: number
        umbral_alerta?: number
        [key: string]: unknown
    }
}

/**
 * Response al asignar sensor
 */
export interface AsignarSensorResponse {
    message: string
    asignacion: {
        id: number
        dispositivo: number
        dispositivo_nombre: string
        sensor: number
        sensor_nombre: string
        configuracion_json: Record<string, unknown>
        activo: boolean
        fecha_asignacion: string
    }
}

/**
 * Datos para asignar operador
 */
export interface AsignarOperadorDto {
    operador_id: number
}

/**
 * Response al asignar operador
 */
export interface AsignarOperadorResponse {
    message: string
    dispositivo: Dispositivo
}

/**
 * Credenciales MQTT del dispositivo
 */
export interface MqttCredentials {
    has_emqx_user: boolean
    emqx_username: string
    password?: string // Solo para superusuarios
    client_id: string
    mqtt_enabled: boolean
    broker_host: string
    broker_port: number
    topics?: {
        publish: string[]
        subscribe: string[]
    }
    message?: string // Para operadores sin permisos completos
}

/**
 * Dispositivo con info MQTT
 */
export interface DispositivoMqtt {
    id: number
    nombre: string
    mqtt_enabled: boolean
    mqtt_client_id: string
    connection_status: string
    last_seen: string
}

// ============================================
// SERVICIO DE DISPOSITIVOS
// ============================================

export const dispositivosService = {
    /**
     * 1. Listar Dispositivos
     * GET /api/devices/
     */
    getAll: async (params?: DispositivoQueryParams): Promise<DispositivosResponse> => {
        const queryParams = new URLSearchParams()
        
        if (params?.search) queryParams.append('search', params.search)
        if (params?.tipo) queryParams.append('tipo', params.tipo)
        if (params?.estado) queryParams.append('estado', params.estado)
        if (params?.operador) queryParams.append('operador', String(params.operador))
        if (params?.page) queryParams.append('page', String(params.page))
        if (params?.page_size) queryParams.append('page_size', String(params.page_size))

        const query = queryParams.toString()
        const url = query ? `${API_BASE_URL}/api/devices/?${query}` : `${API_BASE_URL}/api/devices/`

        return authenticatedGet<DispositivosResponse>(url)
    },

    /**
     * 2. Crear Dispositivo
     * POST /api/devices/
     */
    create: async (data: CreateDispositivoDto): Promise<Dispositivo> => {
        return authenticatedPost<Dispositivo>(`${API_BASE_URL}/api/devices/`, data)
    },

    /**
     * 7. Obtener Detalle de Dispositivo
     * GET /api/devices/{id}/
     */
    getById: async (id: number): Promise<Dispositivo> => {
        return authenticatedGet<Dispositivo>(`${API_BASE_URL}/api/devices/${id}/`)
    },

    /**
     * 8. Actualizar Dispositivo (PUT)
     * PUT /api/devices/{id}/
     */
    update: async (id: number, data: CreateDispositivoDto): Promise<Dispositivo> => {
        return authenticatedPut<Dispositivo>(`${API_BASE_URL}/api/devices/${id}/`, data)
    },

    /**
     * 8. Actualizar Dispositivo (PATCH)
     * PATCH /api/devices/{id}/
     */
    partialUpdate: async (
        id: number,
        data: Partial<CreateDispositivoDto>
    ): Promise<Dispositivo> => {
        return authenticatedPatch<Dispositivo>(`${API_BASE_URL}/api/devices/${id}/`, data)
    },

    /**
     * 9. Eliminar Dispositivo
     * DELETE /api/devices/{id}/
     */
    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/devices/${id}/`)
    },

    /**
     * 3. Asignar Sensor a Dispositivo
     * POST /api/devices/{id}/assign_sensor/
     */
    assignSensor: async (
        dispositivoId: number,
        data: AsignarSensorDto
    ): Promise<AsignarSensorResponse> => {
        return authenticatedPost<AsignarSensorResponse>(
            `${API_BASE_URL}/api/devices/${dispositivoId}/assign_sensor/`,
            data
        )
    },

    /**
     * 5. Remover Sensor de Dispositivo
     * DELETE /api/devices/{id}/remove_sensor/?sensor_id=1
     */
    removeSensor: async (dispositivoId: number, sensorId: number): Promise<{ message: string }> => {
        return authenticatedDelete<{ message: string }>(
            `${API_BASE_URL}/api/devices/${dispositivoId}/remove_sensor/?sensor_id=${sensorId}`
        )
    },

    /**
     * 4. Asignar Operador a Dispositivo
     * POST /api/devices/{id}/assign-operator/
     */
    assignOperator: async (
        dispositivoId: number,
        data: AsignarOperadorDto
    ): Promise<AsignarOperadorResponse> => {
        return authenticatedPost<AsignarOperadorResponse>(
            `${API_BASE_URL}/api/devices/${dispositivoId}/assign-operator/`,
            data
        )
    },

    /**
     * 6. Tipos de Dispositivos
     * GET /api/devices/tipos/
     */
    getTipos: async (): Promise<TipoDispositivo[]> => {
        return authenticatedGet<TipoDispositivo[]>(`${API_BASE_URL}/api/devices/tipos/`)
    },

    /**
     * 10. Dispositivos con MQTT Habilitado
     * GET /api/devices/mqtt-devices/
     */
    getMqttDevices: async (): Promise<DispositivoMqtt[]> => {
        return authenticatedGet<DispositivoMqtt[]>(`${API_BASE_URL}/api/devices/mqtt-devices/`)
    },

    /**
     * 11. Obtener Credenciales MQTT del Dispositivo
     * GET /api/devices/{id}/mqtt-credentials/
     */
    getMqttCredentials: async (dispositivoId: number): Promise<MqttCredentials> => {
        return authenticatedGet<MqttCredentials>(
            `${API_BASE_URL}/api/devices/${dispositivoId}/mqtt-credentials/`
        )
    },
}

// ============================================
// EXPORTAR PARA COMPATIBILIDAD
// ============================================

// Exportar también como default para mantener compatibilidad
export default dispositivosService
