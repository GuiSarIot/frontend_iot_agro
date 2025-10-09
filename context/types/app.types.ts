// Tipos de estado global
export interface UserInfo {
    name: string;
    email: string;
    role: string;
    module: string | null;
    id: string | number | null;
    roles: string[];
    nameImage: string;
    hasRolSistema: boolean;
    nameRolSistema: string;
    levelAccessRolSistema: string | number;
}

export interface AuthContextState {
    token: string;
    user: string | number | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    isError: boolean;
}

export interface AppState {
    title: string;
    navBarState: boolean;
    isLoading: boolean;
    userInfo: UserInfo;
    authContext: AuthContextState;
}

// Acciones del reducer
export type AppAction =
    | { type: 'CHANGE_TITLE'; newTitle: string }
    | { type: 'CHANGE_USER_INFO'; newUserInfo: Partial<UserInfo> | UserInfo }
    | {
        type: 'CHANGE_AUTH_CONTEXT';
        newAuthContext: Partial<AuthContextState> | AuthContextState;
        }
    | { type: 'SHOW_NAVBAR'; isActive: boolean }
    | { type: 'SHOW_LOADER'; isActive: boolean };

// API expuesta por el Context
export interface AppContextValue {
    appState: AppState;
    changeTitle: (newTitle: string) => void;
    changeUserInfo: (newUserInfo: Partial<UserInfo> | UserInfo) => void;
    changeAuthContext: (
        newAuthContext: Partial<AuthContextState> | AuthContextState
    ) => void;
    showNavbar: (isActive: boolean) => void;
    showLoader: (isActive: boolean) => void;
    dispatch?: React.Dispatch<AppAction>;
}
