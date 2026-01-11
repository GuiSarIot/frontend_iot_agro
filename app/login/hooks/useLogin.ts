'use client'

import { useEffect, useRef, FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import DOMPurifyImport from 'dompurify'
import Swal from 'sweetalert2'

import { useAppContext } from '@/context/appContext' // si exportaste el hook

import { loginRequest, encryptUserId, getRoute, saveRoute } from '../services/auth.api'
import { tokenService } from '../services/token.service'

import type { LoginRequestBody } from '../services/auth.types'

export function useLogin() {
    const router = useRouter()
    const { appState, changeUserInfo, changeAuthContext, changeTitle, showLoader } = useAppContext()

    const DOMPurify = DOMPurifyImport as typeof DOMPurifyImport

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const passwordRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const run = async () => {
            showLoader(true)
            await validateSession()
            showLoader(false)
        }
        void run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const validateSession = async () => {
        const { isLogged, title, route, user } = await getRoute()
        if (user !== 'false' && user !== undefined && isLogged !== 'false' && isLogged !== undefined) {
            if (title) changeTitle(title)
            if (route) router.push(route)
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        showLoader(true)

        const username = DOMPurify.sanitize(usernameRef.current?.value ?? '')
        const password = DOMPurify.sanitize(passwordRef.current?.value ?? '')

        const body: LoginRequestBody = { username, password }
        const { status, data } = await loginRequest(body)

        if (status === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: (data as unknown as { message?: string })?.message || 'Ocurrió un error al iniciar sesión, por favor intenta de nuevo',
            })
            showLoader(false)
            return
        }

        // Almacenar tokens JWT primero
        tokenService.setAccessToken(data.access)
        tokenService.setRefreshToken(data.refresh)

        // Ahora cifrar el ID con el token
        const idEncrypted = await encryptUserId(String(data.user.id), data.access)

        changeAuthContext({
            ...appState.authContext,
            isLoggedIn: true,
        })

        // Extraer los códigos de permisos para compatibilidad
        // Manejar el caso cuando rol_detail o permisos son null/undefined
        const permissionCodes = data.user.rol_detail?.permisos 
            ? data.user.rol_detail.permisos.map(p => p.codigo)
            : []
        
        // Si es superusuario, agregar el permiso especial
        if (data.user.is_superuser) {
            permissionCodes.push('is_superuser')
        }

        // Obtener el nombre del rol de forma segura
        const roleName = data.user.rol_detail?.nombre || 'Usuario'

        changeUserInfo({
            name: data.user.full_name,
            email: data.user.email,
            role: roleName,
            module: '/dashboard', 
            id: String(data.user.id),
            roles: permissionCodes,
            nameImage: '',
            hasRolSistema: data.user.is_superuser || data.user.is_staff,
            nameRolSistema: roleName,
            levelAccessRolSistema: data.user.is_superuser ? 'ROOT' : 'NORMAL'
        })

        // Determinar ruta de redirección según el tipo de usuario
        const isAdmin = data.user.is_superuser || data.user.is_staff
        const redirectRoute = isAdmin ? '/dashboard/portal_admin' : '/dashboard/portal_usuario'
        const redirectTitle = isAdmin ? 'Portal Admin' : 'Mi Portal'

        changeTitle(redirectTitle)
        
        try {
            await saveRoute({
                routeInfo: redirectRoute, 
                title: redirectTitle,
                isLogged: 'true',
                user: idEncrypted,
                token: data.access,
                role: roleName,
            })
        } catch (error) {
            console.error('useLogin - Error guardando ruta:', error)
        }

        showLoader(false)
        router.push(redirectRoute) 
    }

    return {
        usernameRef,
        passwordRef,
        handleSubmit,
    }
}