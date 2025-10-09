import { AppState } from './types/app.types'

export const initialState: AppState = {
    title: '',
    navBarState: false,
    isLoading: true,
    userInfo: {
        name: '',
        email: '',
        role: '',
        module: null,
        id: null,
        roles: [],
        nameImage: '',
        hasRolIntitutional: false,
        nameRolIntitutional: '',
        levelAccessRolIntitutional: '',
    },
    authContext: {
        token: '',
        user: null,
        isLoggedIn: false,
        isLoading: false,
        isError: false,
    },
}