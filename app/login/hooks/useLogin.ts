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

        const idEncrypted = await encryptUserId(String(data.user.id))

        // Almacenar tokens JWT
        tokenService.setAccessToken(data.access)
        tokenService.setRefreshToken(data.refresh)

        changeAuthContext({
            ...appState.authContext,
            isLoggedIn: true,
        })

        // Extraer los códigos de permisos para compatibilidad
        const permissionCodes = data.user.rol_detail.permisos.map(p => p.codigo)

        changeUserInfo({
            name: data.user.full_name,
            email: data.user.email,
            role: data.user.rol_detail.nombre_display,
            module: '/', 
            id: data.user.id,
            roles: permissionCodes
        })

        changeTitle(data.user.rol_detail.nombre_display)
        await saveRoute({
            routeInfo: '/', 
            title: data.user.rol_detail.nombre_display,
            isLogged: 'true',
            user: idEncrypted,
            token: data.access,
            role: data.user.rol_detail.nombre_display,
        })

        showLoader(false)
        router.push('/') 
    }

    return {
        usernameRef,
        passwordRef,
        handleSubmit,
    }
}