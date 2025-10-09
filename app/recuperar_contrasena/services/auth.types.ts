export type ApiStatus = 'success' | 'error';

export interface RecoveryPasswordRequestBody {
    userEmail: string;
}

export interface RoleInfo {
    role: string;
}

export interface RecoveryPasswordRequestData {
    id: string | number;
    name: string;
    email: string;
    role: RoleInfo;
    module: string;
    roles?: string[];
    has_rol_sistema?: boolean;
    rol_sistema?: string;
    rol_sistema_level_access?: string | number;
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
    isLogged: string;
    user: string;
    token: string;
    role: string;
}
