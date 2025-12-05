'use client'

import {
    authenticatedGet,
    authenticatedPost,
    authenticatedPut,
    authenticatedPatch,
    authenticatedDelete,
} from '@/app/login/services/authenticated-fetch.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Ejemplo de servicio para gestionar dispositivos
 * Reemplaza con tus propios tipos según tu backend
 */

export interface Dispositivo {
    id: number
    nombre: string
    tipo: string
    estado: string
    ubicacion?: string
    created_at: string
    updated_at: string
}

export interface CreateDispositivoDto {
    nombre: string
    tipo: string
    estado: string
    ubicacion?: string
}

export const dispositivosService = {
    /**
     * Obtiene todos los dispositivos
     */
    getAll: async (): Promise<Dispositivo[]> => {
        return authenticatedGet<Dispositivo[]>(`${API_BASE_URL}/api/dispositivos/`)
    },

    /**
     * Obtiene un dispositivo por ID
     */
    getById: async (id: number): Promise<Dispositivo> => {
        return authenticatedGet<Dispositivo>(`${API_BASE_URL}/api/dispositivos/${id}/`)
    },

    /**
     * Crea un nuevo dispositivo
     */
    create: async (data: CreateDispositivoDto): Promise<Dispositivo> => {
        return authenticatedPost<Dispositivo>(`${API_BASE_URL}/api/dispositivos/`, data)
    },

    /**
     * Actualiza un dispositivo completo (PUT)
     */
    update: async (id: number, data: CreateDispositivoDto): Promise<Dispositivo> => {
        return authenticatedPut<Dispositivo>(
            `${API_BASE_URL}/api/dispositivos/${id}/`,
            data
        )
    },

    /**
     * Actualiza parcialmente un dispositivo (PATCH)
     */
    partialUpdate: async (
        id: number,
        data: Partial<CreateDispositivoDto>
    ): Promise<Dispositivo> => {
        return authenticatedPatch<Dispositivo>(
            `${API_BASE_URL}/api/dispositivos/${id}/`,
            data
        )
    },

    /**
     * Elimina un dispositivo
     */
    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/dispositivos/${id}/`)
    },
}

/**
 * Ejemplo de servicio para gestionar sensores
 */

export interface Sensor {
    id: number
    nombre: string
    tipo: string
    unidad_medida: string
    created_at: string
    updated_at: string
}

export const sensoresService = {
    getAll: async (): Promise<Sensor[]> => {
        return authenticatedGet<Sensor[]>(`${API_BASE_URL}/api/sensores/`)
    },

    getById: async (id: number): Promise<Sensor> => {
        return authenticatedGet<Sensor>(`${API_BASE_URL}/api/sensores/${id}/`)
    },

    create: async (data: Omit<Sensor, 'id' | 'created_at' | 'updated_at'>): Promise<Sensor> => {
        return authenticatedPost<Sensor>(`${API_BASE_URL}/api/sensores/`, data)
    },

    update: async (
        id: number,
        data: Omit<Sensor, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Sensor> => {
        return authenticatedPut<Sensor>(`${API_BASE_URL}/api/sensores/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/sensores/${id}/`)
    },
}

/**
 * Ejemplo de servicio para gestionar usuarios
 */

export interface Usuario {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    is_active: boolean
    rol: number
    rol_detail?: {
        nombre: string
        nombre_display: string
    }
}

export const usuariosService = {
    getAll: async (): Promise<Usuario[]> => {
        return authenticatedGet<Usuario[]>(`${API_BASE_URL}/api/usuarios/`)
    },

    getById: async (id: number): Promise<Usuario> => {
        return authenticatedGet<Usuario>(`${API_BASE_URL}/api/usuarios/${id}/`)
    },

    create: async (data: {
        username: string
        email: string
        password: string
        first_name: string
        last_name: string
        rol: number
    }): Promise<Usuario> => {
        return authenticatedPost<Usuario>(`${API_BASE_URL}/api/usuarios/`, data)
    },

    update: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
        return authenticatedPatch<Usuario>(`${API_BASE_URL}/api/usuarios/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/usuarios/${id}/`)
    },
}

/**
 * Ejemplo de servicio para gestionar lecturas de sensores
 */

export interface Lectura {
    id: number
    sensor: number
    dispositivo: number
    valor: number
    timestamp: string
    created_at: string
}

export const lecturasService = {
    /**
     * Obtiene lecturas con filtros opcionales
     */
    getAll: async (params?: {
        sensor?: number
        dispositivo?: number
        fecha_inicio?: string
        fecha_fin?: string
    }): Promise<Lectura[]> => {
        const queryParams = new URLSearchParams()
        if (params?.sensor) queryParams.append('sensor', String(params.sensor))
        if (params?.dispositivo) queryParams.append('dispositivo', String(params.dispositivo))
        if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio)
        if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin)

        const query = queryParams.toString()
        const url = query
            ? `${API_BASE_URL}/api/lecturas/?${query}`
            : `${API_BASE_URL}/api/lecturas/`

        return authenticatedGet<Lectura[]>(url)
    },

    create: async (data: {
        sensor: number
        dispositivo: number
        valor: number
    }): Promise<Lectura> => {
        return authenticatedPost<Lectura>(`${API_BASE_URL}/api/lecturas/`, data)
    },
}
