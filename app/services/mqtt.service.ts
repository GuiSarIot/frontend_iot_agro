import {
    authenticatedGet,
    authenticatedPost,
    authenticatedPatch,
    authenticatedDelete,
} from '@/app/login/services/authenticated-fetch.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ============================================
// MQTT BROKERS
// ============================================

export interface MqttBroker {
    id: number
    nombre: string
    host: string
    port: number
    protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss'
    protocol_display: string
    username?: string
    keepalive: number
    clean_session: boolean
    use_tls: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CreateMqttBrokerDto {
    nombre: string
    host: string
    port: number
    protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss'
    username?: string
    password?: string
    keepalive: number
    clean_session: boolean
    use_tls: boolean
    is_active: boolean
}

export type UpdateMqttBrokerDto = Partial<CreateMqttBrokerDto>

export interface MqttBrokersResponse {
    count: number
    results: MqttBroker[]
}

export const mqttBrokersService = {
    getAll: async (params?: {
        search?: string
        active_only?: boolean
        protocol?: string
    }): Promise<MqttBrokersResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.append('search', params.search)
        if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString())
        if (params?.protocol) queryParams.append('protocol', params.protocol)

        const url = `${API_BASE_URL}/api/mqtt/brokers/${queryParams.toString() ? `?${queryParams}` : ''}`
        return authenticatedGet<MqttBrokersResponse>(url)
    },

    getById: async (id: number): Promise<MqttBroker> => {
        return authenticatedGet<MqttBroker>(`${API_BASE_URL}/api/mqtt/brokers/${id}/`)
    },

    create: async (data: CreateMqttBrokerDto): Promise<MqttBroker> => {
        return authenticatedPost<MqttBroker>(`${API_BASE_URL}/api/mqtt/brokers/`, data)
    },

    update: async (id: number, data: UpdateMqttBrokerDto): Promise<MqttBroker> => {
        return authenticatedPatch<MqttBroker>(`${API_BASE_URL}/api/mqtt/brokers/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/mqtt/brokers/${id}/`)
    },

    activate: async (id: number): Promise<{ message: string }> => {
        return authenticatedPost(`${API_BASE_URL}/api/mqtt/brokers/${id}/activate/`, {})
    },

    deactivate: async (id: number): Promise<{ message: string }> => {
        return authenticatedPost(`${API_BASE_URL}/api/mqtt/brokers/${id}/deactivate/`, {})
    },

    testConnection: async (brokerId: number, timeout: number = 10): Promise<{
        success: boolean
        message: string
        broker: MqttBroker
    }> => {
        return authenticatedPost(`${API_BASE_URL}/api/mqtt/test-connection/`, {
            broker_id: brokerId,
            timeout
        })
    }
}
// ============================================
// MQTT CREDENTIALS
// ============================================

export interface MqttCredential {
    id: number
    dispositivo: number
    dispositivo_nombre: string
    client_id: string
    username: string
    has_password: boolean
    use_device_cert: boolean
    has_cert: boolean
    is_active: boolean
    created_at: string
}

export interface MqttCredentialDetail extends MqttCredential {
    password?: string
}

export interface CreateMqttCredentialDto {
    dispositivo: number
    client_id: string
    username: string
    password?: string
    use_device_cert: boolean
    is_active: boolean
}

export type UpdateMqttCredentialDto = Partial<CreateMqttCredentialDto>

export interface MqttCredentialsResponse {
    count: number
    results: MqttCredential[]
}

export const mqttCredentialsService = {
    getAll: async (params?: {
        search?: string
        dispositivo?: number
        active_only?: boolean
    }): Promise<MqttCredentialsResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.append('search', params.search)
        if (params?.dispositivo) queryParams.append('dispositivo', params.dispositivo.toString())
        if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString())

        const url = `${API_BASE_URL}/api/mqtt/credentials/${queryParams.toString() ? `?${queryParams}` : ''}`
        return authenticatedGet<MqttCredentialsResponse>(url)
    },

    getById: async (id: number): Promise<MqttCredentialDetail> => {
        return authenticatedGet<MqttCredentialDetail>(`${API_BASE_URL}/api/mqtt/credentials/${id}/`)
    },

    create: async (data: CreateMqttCredentialDto): Promise<MqttCredential> => {
        return authenticatedPost<MqttCredential>(`${API_BASE_URL}/api/mqtt/credentials/`, data)
    },

    update: async (id: number, data: UpdateMqttCredentialDto): Promise<MqttCredential> => {
        return authenticatedPatch<MqttCredential>(`${API_BASE_URL}/api/mqtt/credentials/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/mqtt/credentials/${id}/`)
    }
}

// ============================================
// MQTT TOPICS
// ============================================

export interface MqttTopic {
    id: number
    nombre: string
    topic_pattern: string
    tipo: 'publish' | 'subscribe' | 'both'
    tipo_display: string
    qos: 0 | 1 | 2
    qos_display: string
    retain: boolean
    descripcion?: string
    created_at: string
}

export interface CreateMqttTopicDto {
    nombre: string
    topic_pattern: string
    tipo: 'publish' | 'subscribe' | 'both'
    qos: 0 | 1 | 2
    retain: boolean
    descripcion?: string
}

export type UpdateMqttTopicDto = Partial<CreateMqttTopicDto>

export interface MqttTopicsResponse {
    count: number
    results: MqttTopic[]
}

export const mqttTopicsService = {
    getAll: async (params?: {
        search?: string
        tipo?: string
        qos?: number
    }): Promise<MqttTopicsResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.append('search', params.search)
        if (params?.tipo) queryParams.append('tipo', params.tipo)
        if (params?.qos !== undefined) queryParams.append('qos', params.qos.toString())

        const url = `${API_BASE_URL}/api/mqtt/topics/${queryParams.toString() ? `?${queryParams}` : ''}`
        return authenticatedGet<MqttTopicsResponse>(url)
    },

    getById: async (id: number): Promise<MqttTopic> => {
        return authenticatedGet<MqttTopic>(`${API_BASE_URL}/api/mqtt/topics/${id}/`)
    },

    create: async (data: CreateMqttTopicDto): Promise<MqttTopic> => {
        return authenticatedPost<MqttTopic>(`${API_BASE_URL}/api/mqtt/topics/`, data)
    },

    update: async (id: number, data: UpdateMqttTopicDto): Promise<MqttTopic> => {
        return authenticatedPatch<MqttTopic>(`${API_BASE_URL}/api/mqtt/topics/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/mqtt/topics/${id}/`)
    },

    getPublishTopics: async (): Promise<MqttTopic[]> => {
        return authenticatedGet<MqttTopic[]>(`${API_BASE_URL}/api/mqtt/topics/publish-topics/`)
    },

    getSubscribeTopics: async (): Promise<MqttTopic[]> => {
        return authenticatedGet<MqttTopic[]>(`${API_BASE_URL}/api/mqtt/topics/subscribe-topics/`)
    }
}

// ============================================
// MQTT DEVICE CONFIG
// ============================================

export interface MqttDeviceConfig {
    id: number
    dispositivo: number
    dispositivo_nombre: string
    broker: number
    broker_nombre: string
    publish_topic: number
    publish_topic_nombre: string
    connection_status: 'connected' | 'disconnected' | 'error'
    connection_status_display: string
    qos: 0 | 1 | 2
    qos_display: string
    is_active: boolean
    last_connection?: string
}

export interface CreateMqttDeviceConfigDto {
    dispositivo: number
    broker: number
    publish_topic: number
    subscribe_topics?: number[]
    qos: 0 | 1 | 2
    retain: boolean
    is_active: boolean
}

export type UpdateMqttDeviceConfigDto = Partial<CreateMqttDeviceConfigDto>

export interface MqttDeviceConfigsResponse {
    count: number
    results: MqttDeviceConfig[]
}

export const mqttDeviceConfigService = {
    getAll: async (params?: {
        dispositivo?: number
        broker?: number
        connection_status?: string
        active_only?: boolean
    }): Promise<MqttDeviceConfigsResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.dispositivo) queryParams.append('dispositivo', params.dispositivo.toString())
        if (params?.broker) queryParams.append('broker', params.broker.toString())
        if (params?.connection_status) queryParams.append('connection_status', params.connection_status)
        if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString())

        const url = `${API_BASE_URL}/api/mqtt/device-config/${queryParams.toString() ? `?${queryParams}` : ''}`
        return authenticatedGet<MqttDeviceConfigsResponse>(url)
    },

    getById: async (id: number): Promise<MqttDeviceConfig> => {
        return authenticatedGet<MqttDeviceConfig>(`${API_BASE_URL}/api/mqtt/device-config/${id}/`)
    },

    create: async (data: CreateMqttDeviceConfigDto): Promise<MqttDeviceConfig> => {
        return authenticatedPost<MqttDeviceConfig>(`${API_BASE_URL}/api/mqtt/device-config/`, data)
    },

    update: async (id: number, data: UpdateMqttDeviceConfigDto): Promise<MqttDeviceConfig> => {
        return authenticatedPatch<MqttDeviceConfig>(`${API_BASE_URL}/api/mqtt/device-config/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/mqtt/device-config/${id}/`)
    },

    updateConnectionStatus: async (id: number, status: 'connected' | 'disconnected' | 'error'): Promise<{
        message: string
        config: MqttDeviceConfig
    }> => {
        return authenticatedPost(`${API_BASE_URL}/api/mqtt/device-config/${id}/update-connection-status/`, {
            status
        })
    }
}

// ============================================
// EMQX USERS
// ============================================

export interface EmqxUser {
    id: number
    username: string
    dispositivo?: number
    dispositivo_nombre?: string
    is_superuser: boolean
    created: string
    acl_rules_count: number
}

export interface CreateEmqxUserDto {
    username: string
    password: string
    dispositivo?: number
    is_superuser: boolean
}

export interface CreateEmqxUserWithAclDto extends CreateEmqxUserDto {
    acl_rules: {
        topic: string
        action: 'publish' | 'subscribe' | 'all'
        permission: 'allow' | 'deny'
    }[]
}

export type UpdateEmqxUserDto = Partial<Omit<CreateEmqxUserDto, 'password'>>

export interface EmqxUsersResponse {
    count: number
    results: EmqxUser[]
}

export const emqxUsersService = {
    getAll: async (params?: {
        search?: string
        is_superuser?: boolean
        dispositivo?: number
    }): Promise<EmqxUsersResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.append('search', params.search)
        if (params?.is_superuser !== undefined) queryParams.append('is_superuser', params.is_superuser.toString())
        if (params?.dispositivo) queryParams.append('dispositivo', params.dispositivo.toString())

        const url = `${API_BASE_URL}/api/mqtt/emqx-users/${queryParams.toString() ? `?${queryParams}` : ''}`
        return authenticatedGet<EmqxUsersResponse>(url)
    },

    getById: async (id: number): Promise<EmqxUser> => {
        return authenticatedGet<EmqxUser>(`${API_BASE_URL}/api/mqtt/emqx-users/${id}/`)
    },

    create: async (data: CreateEmqxUserDto): Promise<EmqxUser> => {
        return authenticatedPost<EmqxUser>(`${API_BASE_URL}/api/mqtt/emqx-users/`, data)
    },

    createWithAcl: async (data: CreateEmqxUserWithAclDto): Promise<EmqxUser> => {
        return authenticatedPost<EmqxUser>(`${API_BASE_URL}/api/mqtt/emqx-users/create-with-acl/`, data)
    },

    update: async (id: number, data: UpdateEmqxUserDto): Promise<EmqxUser> => {
        return authenticatedPatch<EmqxUser>(`${API_BASE_URL}/api/mqtt/emqx-users/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/mqtt/emqx-users/${id}/`)
    },

    changePassword: async (id: number, password: string): Promise<{ message: string }> => {
        return authenticatedPost(`${API_BASE_URL}/api/mqtt/emqx-users/${id}/change-password/`, {
            password
        })
    },

    getCredentials: async (id: number): Promise<{
        username: string
        password_hash: string
        salt: string
        is_superuser: boolean
        dispositivo: string
        created: string
    }> => {
        return authenticatedGet(`${API_BASE_URL}/api/mqtt/emqx-users/${id}/credentials/`)
    }
}

// ============================================
// EMQX ACL
// ============================================

export interface EmqxAcl {
    id: number
    emqx_user: number
    username: string
    topic: string
    action: 'publish' | 'subscribe' | 'all'
    action_display: string
    permission: 'allow' | 'deny'
    permission_display: string
    created_at: string
}

export interface CreateEmqxAclDto {
    emqx_user: number
    username: string
    topic: string
    action: 'publish' | 'subscribe' | 'all'
    permission: 'allow' | 'deny'
}

export type UpdateEmqxAclDto = Partial<CreateEmqxAclDto>

export interface EmqxAclResponse {
    count: number
    results: EmqxAcl[]
}

export const emqxAclService = {
    getAll: async (params?: {
        search?: string
        username?: string
        action?: string
        permission?: string
        emqx_user?: number
    }): Promise<EmqxAclResponse> => {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.append('search', params.search)
        if (params?.username) queryParams.append('username', params.username)
        if (params?.action) queryParams.append('action', params.action)
        if (params?.permission) queryParams.append('permission', params.permission)
        if (params?.emqx_user) queryParams.append('emqx_user', params.emqx_user.toString())

        const url = `${API_BASE_URL}/api/mqtt/emqx-acl/${queryParams.toString() ? `?${queryParams}` : ''}`
        return authenticatedGet<EmqxAclResponse>(url)
    },

    getById: async (id: number): Promise<EmqxAcl> => {
        return authenticatedGet<EmqxAcl>(`${API_BASE_URL}/api/mqtt/emqx-acl/${id}/`)
    },

    create: async (data: CreateEmqxAclDto): Promise<EmqxAcl> => {
        return authenticatedPost<EmqxAcl>(`${API_BASE_URL}/api/mqtt/emqx-acl/`, data)
    },

    update: async (id: number, data: UpdateEmqxAclDto): Promise<EmqxAcl> => {
        return authenticatedPatch<EmqxAcl>(`${API_BASE_URL}/api/mqtt/emqx-acl/${id}/`, data)
    },

    delete: async (id: number): Promise<void> => {
        return authenticatedDelete(`${API_BASE_URL}/api/mqtt/emqx-acl/${id}/`)
    },

    getByDevice: async (dispositivoId: number): Promise<{
        dispositivo: string
        emqx_username: string
        acl_rules_count: number
        acl_rules: EmqxAcl[]
    }> => {
        return authenticatedGet(`${API_BASE_URL}/api/mqtt/emqx-acl/by-device/?dispositivo_id=${dispositivoId}`)
    }
}

// ============================================
// MQTT UTILITIES
// ============================================

export const mqttUtilitiesService = {
    getDeviceStatus: async (): Promise<{
        total_mqtt_devices: number
        online: number
        offline: number
        error: number
        percentage_online: number
    }> => {
        return authenticatedGet(`${API_BASE_URL}/api/mqtt/device-status/`)
    }
}
