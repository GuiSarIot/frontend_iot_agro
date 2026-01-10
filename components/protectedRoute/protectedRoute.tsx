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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, autoRedirection: _autoRedirection }) => {
    const { appState, changeUserInfo, changeAuthContext, showLoader } = useContext(AppContext.Context)
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
            showLoader(true)
            const { isLogged, route, user, title, role, token } = await GetRoute()
            
            console.log('ProtectedRoute - Datos de GetRoute:', { isLogged, route, user, title, role, hasToken: !!token })

            if (!isLogged || isLogged === 'false' || !user || user === 'false') {
                console.log('ProtectedRoute - No hay sesión, redirigiendo a login')
                SaveRoute({ isLogged: 'false', user: 'false', token: 'false' })
                showLoader(false)
                router.push('/login')
                return
            }

            if (!token || token === 'false') {
                console.log('ProtectedRoute - No hay token, cerrando sesión')
                logoutAndRedirect()
                return
            }

            console.log('ProtectedRoute - Llamando a /api/users/me/ con token')
            const { data, status } = await consumerPublicAPI<UserData>({
                url: `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            console.log('ProtectedRoute - Respuesta de /api/users/me/:', { status, hasData: !!data })

            if (status === 'error' || !data) {
                console.log('ProtectedRoute - Error o sin datos, cerrando sesión')
                logoutAndRedirect()
                return
            }

            updateUserInfo(data, title, role)
            redirectUserBasedOnRole(data, route)
            showLoader(false)
        } catch (error) {
            console.error('Error validando usuario:', error)
            showLoader(false)
            router.push('/login')
        } finally {
            setIsValidating(false)
            showLoader(false)
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

        router.push('/login')
    }

    const updateUserInfo = (data: UserData, _title?: string, _role?: string) => {
        // Extraer los códigos de permisos del usuario
        const permissionCodes = data.rol_detail?.permisos?.map(p => p.codigo) || []
        
        // Si es superusuario, agregar el permiso especial
        if (data.is_superuser) {
            permissionCodes.push('is_superuser')
        }
        
        console.log('ProtectedRoute - Datos del usuario:', data)
        console.log('ProtectedRoute - Permisos extraídos:', permissionCodes)
        
        changeUserInfo({
            name: data.full_name || `${data.first_name} ${data.last_name}`,
            email: data.email,
            role: data.rol_detail?.nombre || '',
            module: '/dashboard',
            id: data.id.toString(),
            roles: permissionCodes,
            nameImage: '',
            hasRolSistema: data.is_superuser || data.is_staff,
            nameRolSistema: data.rol_detail?.nombre || '',
            levelAccessRolSistema: data.is_superuser ? 'ROOT' : 'NORMAL'
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
        // Solo redirigir si estamos en la página de login o raíz
        if (currentUrl === '/' || currentUrl === '/login') {
            // Si hay una ruta guardada y no es login, ir a esa ruta
            if (route && route !== '/login' && route !== '/') {
                router.push(route)
            } else {
                // Si no hay ruta guardada, ir al dashboard
                router.push('/dashboard')
            }
        }
        // De lo contrario, permanecer en la ruta actual (no redirigir)
    }

    // Si no está autenticado, no mostrar nada (el componente redirige en loadUserInfo)
    if (!authContext.isLoggedIn && hasValidated.current) {
        return null
    }

    return <>{children}</>
}

export default ProtectedRoute
