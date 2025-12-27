'use client'

import { useContext, useEffect, useState, useRef } from 'react'

import { useRouter, usePathname } from 'next/navigation'

import consumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import AppContext from '@/context/appContext'

import GetRoute from './getRoute'
import SaveRoute from './saveRoute'

interface Permission {
    id: number
    nombre: string
    codigo: string
    descripcion: string
    created_at: string
}

interface RolDetail {
    id: number
    nombre: string
    nombre_display: string
    descripcion: string
    permisos: Permission[]
    created_at: string
    updated_at: string
}

interface UserData {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    tipo_usuario: string
    tipo_usuario_display: string
    is_active: boolean
    is_staff: boolean
    is_superuser: boolean
    rol: number
    rol_detail: RolDetail
    created_at: string
    updated_at: string
    last_login: string | null
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
    const [isValidating, setIsValidating] = useState(false)
    const hasValidated = useRef(false)

    useEffect(() => {
        if (!hasValidated.current && !isValidating) {
            hasValidated.current = true
            void loadUserInfo()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadUserInfo = async () => {
        if (isValidating) return // Prevenir múltiples llamadas
        
        try {
            setIsValidating(true)
            const { isLogged, route, user, title, role, token } = await GetRoute()

            if (!isLogged || isLogged === 'false' || !user || user === 'false') {
                SaveRoute({ isLogged: 'false', user: 'false', token: 'false' })
                if (autoRedirection) router.push('/login')
                return
            }

            if (!token || token === 'false') {
                logoutAndRedirect()
                return
            }

            const { data, status } = await consumerPublicAPI<UserData>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/users/me/`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (status === 'error' || !data) {
                logoutAndRedirect()
                return
            }

            updateUserInfo(data, title, role)
            redirectUserBasedOnRole(data, route)
        } catch (error) {
            console.error('Error validando usuario:', error)
            if (autoRedirection) router.push('/login')
        } finally {
            setIsValidating(false)
        }
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
        // Extraer los códigos de permisos del usuario
        const permissionCodes = data.rol_detail?.permisos?.map(p => p.codigo) || []
        
        changeUserInfo({
            name: data.full_name || `${data.first_name} ${data.last_name}`,
            email: data.email,
            role: title === 'Login' ? data.rol_detail?.nombre : role || data.rol_detail?.nombre || '',
            module: '', // No existe en la nueva estructura
            id: data.id.toString(),
            roles: permissionCodes, // Ahora roles contiene los códigos de permisos
            nameImage: null, // No existe en la nueva estructura
        })

        changeAuthContext({
            token: '',
            user: data.username,
            isLoggedIn: true,
            isLoading: false,
            isError: false,
        })
    }

    const redirectUserBasedOnRole = (data: UserData, route?: string) => {
        // Si hay una ruta guardada y no es login, ir a esa ruta
        if (route && route !== '/login' && route !== '/') {
            router.push(route)
        } 
        // Si está en la raíz o en login, ir al dashboard
        else if (currentUrl === '/' || currentUrl === '/login') {
            router.push('/dashboard')
        }
        // De lo contrario, permanecer en la ruta actual
        else {
            router.push(currentUrl)
        }
    }

    if (!authContext.isLoggedIn) {
        return null
    }

    return <>{children}</>
}

export default ProtectedRoute
