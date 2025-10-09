'use client'

import { useEffect, useRef, FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import DOMPurifyImport from 'dompurify'
import Swal from 'sweetalert2'

import { useAppContext } from '@/context/appContext' // si exportaste el hook

import { loginRequest, encryptUserId, getRoute, saveRoute } from '../services/auth.api'

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

        const userName = DOMPurify.sanitize(usernameRef.current?.value ?? '')
        const password = DOMPurify.sanitize(passwordRef.current?.value ?? '')

        const body: LoginRequestBody = { userName, password }
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

        const idEncrypted = await encryptUserId(String(data.id))

        changeAuthContext({
            ...appState.authContext,
            isLoggedIn: true,
        })

        changeUserInfo({
            name: data.name,
            email: data.email,
            role: data.role.role,
            module: data.module,
            id: data.id,
            roles: data.roles,
            hasRolIntitutional: data.has_rol_intitutional,
            nameRolIntitutional: data.rol_intitutional,
            levelAccessRolIntitutional: data.rol_intitutional_level_access,
        })

        changeTitle(data.role.role)
        await saveRoute({
            routeInfo: data.module,
            title: data.role.role,
            isLogged: true,
            user: idEncrypted,
            token: data.token,
            role: data.role.role,
        })

        showLoader(false)
        router.push(data.module)
    }

    return {
        usernameRef,
        passwordRef,
        handleSubmit,
    }
}