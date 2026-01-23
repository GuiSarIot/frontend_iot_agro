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
// INTERFACES - LECTURAS
// ============================================

/**
 * Lectura individual de sensor
 */
export interface Lectura {
    id: number
    dispositivo: number
    dispositivo_nombre: string
    sensor: number
    sensor_nombre: string
    sensor_unidad: string
    valor: number
    timestamp: string
    fecha_lectura: string
    unidad: string
    metadata_json: Record<string, unknown>
    mqtt_message_id?: string
    mqtt_qos?: number
    mqtt_retained?: boolean
}

/**
 * Respuesta paginada de lecturas
 */
export interface LecturasResponse {
    count: number
    next?: string
    previous?: string
    results: Lectura[]
}

/**
 * Parámetros de consulta para lecturas
 */
export interface LecturaQueryParams {
    dispositivo?: number
    sensor?: number
    fecha_inicio?: string
    fecha_fin?: string
    ordering?: string
    page?: number
    page_size?: number
}

/**
 * DTO para crear lectura
 */
export interface CreateLecturaDto {
    dispositivo: number
    sensor: number
    valor: number
    metadata_json?: Record<string, unknown>
    mqtt_message_id?: string
    mqtt_qos?: number
    mqtt_retained?: boolean
}

/**
 * DTO para actualizar lectura
 */
export interface UpdateLecturaDto {
    metadata_json?: Record<string, unknown>
}

/**
 * DTO para creación bulk de lecturas
 */
export interface BulkLecturasDto {
    lecturas: Array<{
        dispositivo: number
        sensor: number
        valor: number
        metadata_json?: Record<string, unknown>
    }>
}

/**
 * Respuesta de creación bulk
 */
export interface BulkLecturasResponse {
    message: string
    count: number
}

/**
 * Estadísticas de lecturas
 */
export interface EstadisticasLecturas {
    total: number
    promedio: number
    maximo: number
    minimo: number
    lecturas_mqtt: number
}

/**
 * Lectura resumida (para últimas lecturas)
 */
export interface LecturaResumida {
    id: number
    dispositivo_nombre: string
    sensor_nombre: string
    valor: number
    timestamp: string
}

// ============================================
// SERVICIO DE LECTURAS
// ============================================

export const lecturasService = {
    /**
     * Listar lecturas con filtros y paginación
     * GET /api/readings/
     */
    getAll: async (params?: LecturaQueryParams): Promise<LecturasResponse> => {
        const queryParams = new URLSearchParams()
        
        if (params?.dispositivo) queryParams.append('dispositivo', String(params.dispositivo))
        if (params?.sensor) queryParams.append('sensor', String(params.sensor))
        if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio)
        if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin)
        if (params?.ordering) queryParams.append('ordering', params.ordering)
        if (params?.page) queryParams.append('page', String(params.page))
        if (params?.page_size) queryParams.append('page_size', String(params.page_size))

        const query = queryParams.toString()
        const url = query
            ? `${API_BASE_URL}/api/readings/?${query}`
            : `${API_BASE_URL}/api/readings/`

        return authenticatedGet<LecturasResponse>(url)
    },

    /**
     * Obtener detalle de una lectura específica
     * GET /api/readings/{id}/
     */
    getById: async (id: number): Promise<Lectura> => {
        return authenticatedGet<Lectura>(`${API_BASE_URL}/api/readings/${id}/`)
    },

    /**
     * Crear nueva lectura
     * POST /api/readings/
     */
    create: async (data: CreateLecturaDto): Promise<Lectura> => {
        return authenticatedPost<Lectura>(`${API_BASE_URL}/api/readings/`, data)
    },

    /**
     * Crear lecturas en bulk
     * POST /api/readings/bulk/
     */
    createBulk: async (data: BulkLecturasDto): Promise<BulkLecturasResponse> => {
        return authenticatedPost<BulkLecturasResponse>(`${API_BASE_URL}/api/readings/bulk/`, data)
    },

    /**
     * Actualizar lectura (solo metadata)
     * PUT /api/readings/{id}/
     */
    update: async (id: number, data: UpdateLecturaDto): Promise<Lectura> => {
        return authenticatedPut<Lectura>(`${API_BASE_URL}/api/readings/${id}/`, data)
    },

    /**
     * Actualización parcial de lectura
     * PATCH /api/readings/{id}/
     */
    partialUpdate: async (id: number, data: Partial<UpdateLecturaDto>): Promise<Lectura> => {
        return authenticatedPatch<Lectura>(`${API_BASE_URL}/api/readings/${id}/`, data)
    },

    /**
     * Eliminar lectura
     * DELETE /api/readings/{id}/
     */
    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/readings/${id}/`)
    },

    /**
     * Obtener estadísticas de lecturas
     * GET /api/readings/estadisticas/
     */
    getEstadisticas: async (params?: { dispositivo?: number; sensor?: number }): Promise<EstadisticasLecturas> => {
        const queryParams = new URLSearchParams()
        
        if (params?.dispositivo) queryParams.append('dispositivo', String(params.dispositivo))
        if (params?.sensor) queryParams.append('sensor', String(params.sensor))

        const query = queryParams.toString()
        const url = query
            ? `${API_BASE_URL}/api/readings/estadisticas/?${query}`
            : `${API_BASE_URL}/api/readings/estadisticas/`

        return authenticatedGet<EstadisticasLecturas>(url)
    },

    /**
     * Obtener últimas lecturas
     * GET /api/readings/ultimas/?limit=10
     */
    getUltimas: async (limit: number = 10): Promise<LecturaResumida[]> => {
        const url = `${API_BASE_URL}/api/readings/ultimas/?limit=${Math.min(limit, 100)}`
        return authenticatedGet<LecturaResumida[]>(url)
    },

    /**
     * Obtener mis lecturas (solo dispositivos asignados)
     * GET /api/readings/my-readings/
     * Para usuarios operadores/normales que solo ven dispositivos asignados
     */
    getMyReadings: async (params?: LecturaQueryParams): Promise<LecturasResponse> => {
        const queryParams = new URLSearchParams()
        
        if (params?.dispositivo) queryParams.append('dispositivo', String(params.dispositivo))
        if (params?.sensor) queryParams.append('sensor', String(params.sensor))
        if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio)
        if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin)
        if (params?.ordering) queryParams.append('ordering', params.ordering)
        if (params?.page_size) queryParams.append('limit', String(params.page_size))

        const query = queryParams.toString()
        const url = query
            ? `${API_BASE_URL}/api/readings/my-readings/?${query}`
            : `${API_BASE_URL}/api/readings/my-readings/`

        return authenticatedGet<LecturasResponse>(url)
    },
}

export default lecturasService
