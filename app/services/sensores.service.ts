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
// INTERFACES Y TIPOS
// ============================================

export interface Sensor {
    id: number
    nombre: string
    tipo: string
    tipo_display: string
    unidad_medida: string
    rango_min: number | null
    rango_max: number | null
    estado: 'activo' | 'inactivo' | 'mantenimiento'
    estado_display: string
    descripcion: string
    created_by: number
    created_by_username: string
    created_at: string
    updated_at: string
    // Campos opcionales para MQTT
    mqtt_topic_suffix?: string
    publish_interval?: number
}

export interface SensoresResponse {
    count: number
    results: Sensor[]
}

export interface CreateSensorDto {
    nombre: string
    tipo: string
    unidad_medida: string
    rango_min?: number | null
    rango_max?: number | null
    estado?: 'activo' | 'inactivo' | 'mantenimiento'
    descripcion?: string
}

export interface UpdateSensorDto {
    nombre?: string
    tipo?: string
    unidad_medida?: string
    rango_min?: number | null
    rango_max?: number | null
    estado?: 'activo' | 'inactivo' | 'mantenimiento'
    descripcion?: string
}

export interface TipoSensor {
    value: string
    label: string
}

export interface SensorQueryParams {
    search?: string
    tipo?: string
    estado?: string
    ordering?: string
}

// ============================================
// SERVICIO DE SENSORES
// ============================================

export const sensoresService = {
    /**
     * Listar sensores con filtros y paginación
     */
    getAll: async (params?: SensorQueryParams): Promise<SensoresResponse> => {
        const queryParams = new URLSearchParams()
        
        if (params?.search) queryParams.append('search', params.search)
        if (params?.tipo) queryParams.append('tipo', params.tipo)
        if (params?.estado) queryParams.append('estado', params.estado)
        if (params?.ordering) queryParams.append('ordering', params.ordering)

        const url = `${API_BASE_URL}/api/sensors/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        return authenticatedGet<SensoresResponse>(url)
    },

    /**
     * Obtener sensor por ID
     */
    getById: async (id: number): Promise<Sensor> => {
        return authenticatedGet<Sensor>(`${API_BASE_URL}/api/sensors/${id}/`)
    },

    /**
     * Crear nuevo sensor
     */
    create: async (data: CreateSensorDto): Promise<Sensor> => {
        return authenticatedPost<Sensor>(`${API_BASE_URL}/api/sensors/`, data)
    },

    /**
     * Actualizar sensor (PUT - reemplazo completo)
     */
    update: async (id: number, data: UpdateSensorDto): Promise<Sensor> => {
        return authenticatedPut<Sensor>(`${API_BASE_URL}/api/sensors/${id}/`, data)
    },

    /**
     * Actualizar sensor (PATCH - actualización parcial)
     */
    partialUpdate: async (id: number, data: Partial<UpdateSensorDto>): Promise<Sensor> => {
        return authenticatedPatch<Sensor>(`${API_BASE_URL}/api/sensors/${id}/`, data)
    },

    /**
     * Eliminar sensor
     */
    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/sensors/${id}/`)
    },

    /**
     * Obtener sensores disponibles
     */
    getAvailable: async (): Promise<Sensor[]> => {
        return authenticatedGet<Sensor[]>(`${API_BASE_URL}/api/sensors/available/`)
    },

    /**
     * Obtener tipos de sensores disponibles
     */
    getTipos: async (): Promise<TipoSensor[]> => {
        return authenticatedGet<TipoSensor[]>(`${API_BASE_URL}/api/sensors/tipos/`)
    },

    /**
     * Obtener sensores con MQTT configurado
     */
    getMqttEnabled: async (): Promise<Sensor[]> => {
        return authenticatedGet<Sensor[]>(`${API_BASE_URL}/api/sensors/mqtt-enabled/`)
    }
}
