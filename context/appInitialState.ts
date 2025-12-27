import { AppState } from './types/app.types'

// Detectar preferencia del sistema
const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (savedTheme) return savedTheme
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark'
        }
    }
    return 'light'
}

export const initialState: AppState = {
    title: '',
    navBarState: false,
    sidebarCollapsed: false,
    theme: getInitialTheme(),
    isLoading: true,
    userInfo: {
        name: '',
        email: '',
        role: '',
        module: null,
        id: null,
        roles: [],
        nameImage: '',
        hasRolSistema: false,
        nameRolSistema: '',
        levelAccessRolSistema: '',
    },
    authContext: {
        token: '',
        user: null,
        isLoggedIn: false,
        isLoading: false,
        isError: false,
    },
}