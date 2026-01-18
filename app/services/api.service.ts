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
// IMPORTAR SERVICIOS ESPECIALIZADOS
// ============================================

// Re-exportar el servicio completo de dispositivos desde su archivo especializado
export { 
    dispositivosService,
    type Dispositivo,
    type DispositivosResponse,
    type CreateDispositivoDto,
    type SensorAsignado,
    type TipoDispositivo,
    type DispositivoQueryParams,
    type AsignarSensorDto,
    type AsignarOperadorResponse,
    type AsignarOperadorDto,
    type AsignarSensorResponse,
    type MqttCredentials,
    type RegenerateMqttPasswordResponse,
    type DispositivoMqtt
} from './dispositivos.service'

// Re-exportar el servicio completo de sensores desde su archivo especializado
export {
    sensoresService,
    type Sensor,
    type SensoresResponse,
    type CreateSensorDto,
    type UpdateSensorDto,
    type TipoSensor,
    type SensorQueryParams
} from './sensores.service'

// Re-exportar el servicio completo de lecturas desde su archivo especializado
export {
    lecturasService,
    type Lectura,
    type LecturasResponse,
    type LecturaQueryParams,
    type CreateLecturaDto,
    type UpdateLecturaDto,
    type BulkLecturasDto,
    type BulkLecturasResponse,
    type EstadisticasLecturas,
    type LecturaResumida
} from './lecturas.service'

// Re-exportar los servicios completos de MQTT desde su archivo especializado
export {
    // Brokers
    mqttBrokersService,
    type MqttBroker,
    type MqttBrokersResponse,
    type CreateMqttBrokerDto,
    type UpdateMqttBrokerDto,
    
    // Credentials
    mqttCredentialsService,
    type MqttCredential,
    type MqttCredentialDetail,
    type MqttCredentialsResponse,
    type CreateMqttCredentialDto,
    type UpdateMqttCredentialDto,
    
    // Topics
    mqttTopicsService,
    type MqttTopic,
    type MqttTopicsResponse,
    type CreateMqttTopicDto,
    type UpdateMqttTopicDto,
    
    // Device Config
    mqttDeviceConfigService,
    type MqttDeviceConfig,
    type MqttDeviceConfigsResponse,
    type CreateMqttDeviceConfigDto,
    type UpdateMqttDeviceConfigDto,
    
    // EMQX Users
    emqxUsersService,
    type EmqxUser,
    type EmqxUsersResponse,
    type CreateEmqxUserDto,
    type CreateEmqxUserWithAclDto,
    type UpdateEmqxUserDto,
    
    // EMQX ACL
    emqxAclService,
    type EmqxAcl,
    type EmqxAclResponse,
    type CreateEmqxAclDto,
    type UpdateEmqxAclDto,
    
    // Utilities
    mqttUtilitiesService
} from './mqtt.service'

// Re-exportar el servicio de comandos MQTT
export {
    mqttCommandsService,
    type DimmerParams,
    type CustomCommandParams,
    type AvailableCommand,
    type AvailableCommandsResponse,
    type SendCommandRequest,
    type SendCommandResponse,
    type LedStatus,
    type DimmerStatus,
    type DeviceStatus
} from './mqtt-commands.service'

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

export interface UsuariosResponse {
    count: number
    next: string | null
    previous: string | null
    results: Usuario[]
}

export const usuariosService = {
    getAll: async (): Promise<UsuariosResponse> => {
        return authenticatedGet<UsuariosResponse>(`${API_BASE_URL}/api/users/`)
    },

    getById: async (id: number): Promise<Usuario> => {
        return authenticatedGet<Usuario>(`${API_BASE_URL}/api/users/${id}/`)
    },

    create: async (data: {
        username: string
        email: string
        password: string
        first_name: string
        last_name: string
        rol: number
    }): Promise<Usuario> => {
        return authenticatedPost<Usuario>(`${API_BASE_URL}/api/users/`, data)
    },

    update: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
        return authenticatedPatch<Usuario>(`${API_BASE_URL}/api/users/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/users/${id}/`)
    },
}

// Servicio de lecturas movido a lecturas.service.ts

/**
 * Servicio para gestionar roles
 */

export interface Rol {
    id: number
    nombre: string
    descripcion?: string
    permisos?: string[]
}

export const rolesService = {
    /**
     * Obtiene todos los roles disponibles
     */
    getAll: async (): Promise<Rol[]> => {
        return authenticatedGet<Rol[]>(`${API_BASE_URL}/api/roles/`)
    },

    /**
     * Obtiene un rol por ID
     */
    getById: async (id: number): Promise<Rol> => {
        return authenticatedGet<Rol>(`${API_BASE_URL}/api/roles/${id}/`)
    },

    /**
     * Crea un nuevo rol
     */
    create: async (data: Omit<Rol, 'id'>): Promise<Rol> => {
        return authenticatedPost<Rol>(`${API_BASE_URL}/api/roles/`, data)
    },

    /**
     * Actualiza un rol
     */
    update: async (id: number, data: Partial<Rol>): Promise<Rol> => {
        return authenticatedPatch<Rol>(`${API_BASE_URL}/api/roles/${id}/`, data)
    },

    /**
     * Elimina un rol
     */
    delete: async (id: number): Promise<void> => {
        return authenticatedDelete<void>(`${API_BASE_URL}/api/roles/${id}/`)
    },
}

/**
 * Servicio para gestionar logs de auditoría
 */

export interface AuditLog {
    id: number
    timestamp: string
    user: number
    username: string
    model_name: string
    object_id: string
    object_repr: string
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    changes: Record<string, { old: any; new: any }>
    ip_address: string
    user_agent: string
}

export interface AuditLogsResponse {
    count: number
    next: string | null
    previous: string | null
    results: AuditLog[]
}

export interface AuditStatsResponse {
    total_logs: number
    by_action: Record<string, number>
    by_model: Record<string, number>
    recent_changes: AuditLog[]
}

export interface AuditLogQueryParams {
    action?: 'CREATE' | 'UPDATE' | 'DELETE'
    model_name?: string
    username?: string
    page?: number
}

export const auditLogsService = {
    /**
     * Obtiene todos los logs de auditoría con filtros opcionales
     */
    getAll: async (params?: AuditLogQueryParams): Promise<AuditLogsResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.action) queryParams.append('action', params.action)
        if (params?.model_name) queryParams.append('model_name', params.model_name)
        if (params?.username) queryParams.append('username', params.username)
        if (params?.page) queryParams.append('page', String(params.page))

        const query = queryParams.toString()
        const url = query
            ? `${API_BASE_URL}/api/audit_logs/?${query}`
            : `${API_BASE_URL}/api/audit_logs/`

        return authenticatedGet<AuditLogsResponse>(url)
    },

    /**
     * Obtiene estadísticas de auditoría
     */
    getStats: async (): Promise<AuditStatsResponse> => {
        return authenticatedGet<AuditStatsResponse>(`${API_BASE_URL}/api/audit_logs/stats/`)
    },

    /**
     * Obtiene un log de auditoría por ID
     */
    getById: async (id: number): Promise<AuditLog> => {
        return authenticatedGet<AuditLog>(`${API_BASE_URL}/api/audit_logs/${id}/`)
    },
}

/**
 * Servicio para gestionar logs de acceso
 */

export interface AccessLog {
    id: number
    timestamp: string
    user: number
    username: string
    module: string
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    status_code: number
    response_time_ms: number
    ip_address: string
    user_agent: string
}

export interface AccessLogsResponse {
    count: number
    next: string | null
    previous: string | null
    results: AccessLog[]
}

export interface AccessStatsResponse {
    total_requests: number
    by_method: Record<string, number>
    by_status: Record<string, number>
    avg_response_time_ms: number
}

export interface AccessLogQueryParams {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    status_code?: number
    module?: string
    page?: number
}

export const accessLogsService = {
    /**
     * Obtiene todos los logs de acceso con filtros opcionales
     */
    getAll: async (params?: AccessLogQueryParams): Promise<AccessLogsResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.method) queryParams.append('method', params.method)
        if (params?.status_code) queryParams.append('status_code', String(params.status_code))
        if (params?.module) queryParams.append('module', params.module)
        if (params?.page) queryParams.append('page', String(params.page))

        const query = queryParams.toString()
        const url = query
            ? `${API_BASE_URL}/api/access_logs/?${query}`
            : `${API_BASE_URL}/api/access_logs/`

        return authenticatedGet<AccessLogsResponse>(url)
    },

    /**
     * Obtiene estadísticas de acceso
     */
    getStats: async (): Promise<AccessStatsResponse> => {
        return authenticatedGet<AccessStatsResponse>(`${API_BASE_URL}/api/access_logs/stats/`)
    },

    /**
     * Obtiene un log de acceso por ID
     */
    getById: async (id: number): Promise<AccessLog> => {
        return authenticatedGet<AccessLog>(`${API_BASE_URL}/api/access_logs/${id}/`)
    },

    /**
     * Crea un log de acceso manual
     */
    create: async (data: {
        module: string
        endpoint: string
        method: string
        status_code: number
        response_time_ms: number
    }): Promise<AccessLog> => {
        return authenticatedPost<AccessLog>(`${API_BASE_URL}/api/access_logs/create_log/`, data)
    },
}
