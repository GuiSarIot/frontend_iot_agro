export type ApiStatus = 'success' | 'error';

export interface LoginRequestBody {
    username: string;
    password: string;
}

export interface Permission {
    id: number;
    nombre: string;
    codigo: string;
    descripcion: string;
    created_at: string;
}

export interface RolDetail {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: Permission[];
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    tipo_usuario: 'interno' | 'externo';
    tipo_usuario_display: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    rol: number;
    rol_detail: RolDetail;
    created_at: string;
    updated_at: string;
    last_login: string | null;
    telegram_chat_id?: string;
    telegram_username?: string;
    telegram_notifications_enabled?: boolean;
    telegram_verified?: boolean;
    can_receive_telegram?: boolean;
}

export interface LoginResponseData {
    user: User;
    refresh: string;
    access: string;
    message: string;
}

export interface EncryptedIdResponse {
    encrypted_id: string;
    user_id: number;
    username: string;
}

// Interfaces anteriores para compatibilidad con el código existente
export interface RoleInfo {
    role: string;
}

export interface LegacyLoginData {
    id: string | number;
    name: string;
    email: string;
    role: RoleInfo;
    module: string;
    roles?: string[];
    has_rol_intitutional?: boolean;
    rol_intitutional?: string;
    rol_intitutional_level_access?: string | number;
    token: string;
}

export interface ConsumerAPIResult<T = unknown> {
    status: ApiStatus;
    data: T;
    message?: string;
}

export interface GetRouteResult {
    isLogged?: string;
    title?: string;
    route?: string;
    user?: string;
}

export interface SaveRouteParams {
    routeInfo: string;
    title: string;
    isLogged: boolean;
    user: string;
    token: string;
    role: string;
}
