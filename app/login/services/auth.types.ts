export type ApiStatus = 'success' | 'error';

export interface LoginRequestBody {
    userName: string;
    password: string;
}

export interface RoleInfo {
    role: string;
}

export interface LoginResponseData {
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
