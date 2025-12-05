'use client'

import { useContext, useEffect } from 'react'

import { useRouter, usePathname } from 'next/navigation'

import consumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import AppContext from '@/context/appContext'

import GetRoute from './getRoute'
import SaveRoute from './saveRoute'

interface UserRole {
    url: string
    [key: string]: unknown
}

interface UserData {
    id: string
    name: string
    email: string
    module?: unknown
    roles: UserRole[]
    has_rol_intitutional?: boolean
    rol_intitutional?: string
    rol_intitutional_level_access?: string
    name_image?: string
    role?: {
        role: string
    }
}

interface ProtectedRouteWithChildren {
    children: React.ReactNode
    autoRedirection?: false
}

interface ProtectedRouteWithoutChildren {
    children?: never
    autoRedirection: true
}

type ProtectedRouteProps = ProtectedRouteWithChildren | ProtectedRouteWithoutChildren

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, autoRedirection }) => {
    const { appState, changeUserInfo, changeAuthContext } = useContext(AppContext.Context)
    const { authContext } = appState
    const router = useRouter()
    const currentUrl = usePathname()

    useEffect(() => {
        // Deshabilitado temporalmente para evitar ciclos infinitos
        // _loadUserInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const _loadUserInfo = async () => {
        const { isLogged, route, user, title, role } = await GetRoute()

        if (!isLogged || !user) {
            SaveRoute({ isLogged: 'false', user: 'false', token: 'false' })
            if (autoRedirection) router.push('/login')
            return
        }

        const { data, status } = await consumerPublicAPI<UserData>({
            url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/`,
        })

        if (status === 'error' || !data) {
            logoutAndRedirect()
            return
        }

        updateUserInfo(data, title, role)
        redirectUserBasedOnRole(data, route)
    }

    const logoutAndRedirect = () => {
        changeAuthContext({
            token: '',
            user: null,
            isLoggedIn: false,
            isLoading: false,
            isError: false,
        })

        changeUserInfo({
            name: '',
            email: '',
            role: '',
            module: null,
            nameImage: null,
            id: '',
            roles: [],
        })

        SaveRoute({
            routeInfo: '/login',
            title: 'Login',
            isLogged: 'false',
            user: 'false',
            token: 'false',
            role: 'false',
        })

        if (autoRedirection) router.push('/login')
    }

    const updateUserInfo = (data: UserData, title?: string, role?: string) => {
        changeUserInfo({
            name: data.name,
            email: data.email,
            role: title === 'Login' ? data.role?.role : role || '',
            module: typeof data.module === 'string' ? data.module : '',
            id: data.id,
            roles: data.roles.map(r => r.url),
            nameImage: data.name_image,
        })

        changeAuthContext({
            token: '',
            user: '',
            isLoggedIn: true,
            isLoading: false,
            isError: false,
        })
    }

    const redirectUserBasedOnRole = (data: UserData, route?: string) => {
        if (validateRolsUser(data.roles)) {
            router.push(currentUrl)
        } else if (route) {
            router.push(route)
        }
    }

    const validateRolsUser = (roles: UserRole[]) => {
        const roleUrl = currentUrl.split('/')[1]
        return roles.some((rol) => rol.url === roleUrl)
    }

    if (!authContext.isLoggedIn) {
        return null
    }

    return <>{children}</>
}

export default ProtectedRoute
