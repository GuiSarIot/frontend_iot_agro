'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import { tokenService } from '@/app/login/services/token.service'
import { UserInfo, AuthContextState } from '@/context/types/app.types'

interface LogoutParams {
    changeAuthContext: (authState: Partial<AuthContextState> | AuthContextState) => void
    changeUserInfo: (userInfo: Partial<UserInfo>) => void
    router: AppRouterInstance
}

const Logout = ({ changeAuthContext, changeUserInfo, router }: LogoutParams) => {
    // 🔹 Limpiar tokens JWT
    tokenService.clearTokens()

    // 🔹 Limpiar contexto de autenticación
    changeAuthContext({
        token: '',
        user: null,
        isLoggedIn: false,
        isLoading: false,
        isError: false,
    })

    // 🔹 Limpiar información del usuario con tipos compatibles
    const emptyUserInfo: Partial<UserInfo> = {
        name: '',
        email: '',
        role: '',
        module: null,                  // compatible con string | null
        id: null,                       // compatible con string | number | null
        roles: [],                       // array vacío
        nameImage: '',
        hasRolIntitutional: false,
        nameRolIntitutional: '',
        levelAccessRolIntitutional: '',  // compatible con string | number
    }

    changeUserInfo(emptyUserInfo)

    // 🔹 Guardar nueva ruta de manera asíncrona y redirigir al login
    SaveRoute({
        routeInfo: '/login',
        title: 'Login',
        isLogged: 'false',
        user: 'false',
        token: 'false',
        role: 'false',
    }).finally(() => {
        router.push('/login')
    })
}

export default Logout
