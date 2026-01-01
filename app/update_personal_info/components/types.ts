// Tipos compartidos para los componentes de perfil

export interface RolDetail {
    id: number
    nombre: string
    descripcion: string
    permisos: Array<{
        id: number
        nombre: string
        codigo: string
        descripcion: string
        created_at: string
    }>
    created_at: string
    updated_at: string
}

export interface UserInfoForm {
    id?: number
    username?: string
    email?: string
    first_name?: string
    last_name?: string
    full_name?: string
    telefono?: string | null
    tipo_usuario?: string
    tipo_usuario_display?: string
    is_active?: boolean
    is_staff?: boolean
    is_superuser?: boolean
    rol?: number
    rol_detail?: RolDetail
    created_at?: string
    updated_at?: string
    last_login?: string | null
    telegram_chat_id?: string | null
    telegram_username?: string | null
    telegram_notifications_enabled?: boolean
    telegram_verified?: boolean
    can_receive_telegram?: boolean | null
}

export interface NotificationSettings {
    email_notifications: boolean
    telegram_notifications: boolean
    telegram_chat_id: string
}
