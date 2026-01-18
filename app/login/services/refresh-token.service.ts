'use client'

import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'

import { tokenService } from './token.service'

import type { ConsumerAPIResult } from './auth.types'

interface RefreshTokenResponse {
    access: string
}

/**
 * Refresca el access token usando el refresh token
 * @returns El nuevo access token o null si falla
 */
export async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenService.getRefreshToken()

    if (!refreshToken) {
        console.error('No hay refresh token disponible')
        return null
    }

    try {
        const response = (await ConsumerPublicAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
            method: 'POST',
            body: {
                refresh: refreshToken,
            },
        })) as ConsumerAPIResult<RefreshTokenResponse>

        if (response.status === 'success' && response.data.access) {
            tokenService.setAccessToken(response.data.access)
            console.info('Token refrescado exitosamente')
            return response.data.access
        }

        console.error('Respuesta inesperada del servidor al refrescar token:', response)
        return null
    } catch (error) {
        console.error('Error al refrescar el token:', error)
        // Limpiar tokens si el refresh token también expiró
        tokenService.clearTokens()
        return null
    }
}

/**
 * Verifica si el access token está expirado y lo refresca si es necesario
 * @returns El access token válido o null si no se pudo refrescar
 */
export async function ensureValidToken(): Promise<string | null> {
    const accessToken = tokenService.getAccessToken()

    if (!accessToken) {
        console.warn('No hay access token disponible')
        return null
    }

    // Si el token no está expirado, retornarlo
    if (!tokenService.isTokenExpired(accessToken)) {
        return accessToken
    }

    // Si está expirado, intentar refrescarlo
    console.info('Token expirado, intentando refrescar...')
    const newToken = await refreshAccessToken()
    
    if (!newToken) {
        console.warn('No se pudo refrescar el token, sesión expirada')
        tokenService.clearTokens()
    }
    
    return newToken
}
