'use client'

/**
 * Utilidades para el manejo de tokens JWT
 * Maneja el access token y refresh token del backend
 */

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const tokenService = {
    /**
     * Guarda el access token en localStorage
     */
    setAccessToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token)
        }
    },

    /**
     * Obtiene el access token desde localStorage
     */
    getAccessToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY)
        }
        return null
    },

    /**
     * Guarda el refresh token en localStorage
     */
    setRefreshToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(REFRESH_TOKEN_KEY, token)
        }
    },

    /**
     * Obtiene el refresh token desde localStorage
     */
    getRefreshToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(REFRESH_TOKEN_KEY)
        }
        return null
    },

    /**
     * Elimina ambos tokens del localStorage (logout)
     */
    clearTokens: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
    },

    /**
     * Verifica si existe un access token
     */
    hasAccessToken: (): boolean => {
        return tokenService.getAccessToken() !== null
    },

    /**
     * Decodifica un JWT (sin verificar la firma)
     * Útil para obtener información del payload
     */
    decodeToken: (token: string): Record<string, unknown> | null => {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    })
                    .join('')
            )
            return JSON.parse(jsonPayload) as Record<string, unknown>
        } catch (error) {
            console.error('Error decodificando token:', error)
            return null
        }
    },

    /**
     * Verifica si un token está expirado
     */
    isTokenExpired: (token: string): boolean => {
        const decoded = tokenService.decodeToken(token)
        if (!decoded || !decoded.exp) {
            return true
        }
        const expirationTime = (decoded.exp as number) * 1000 // Convertir a milisegundos
        return Date.now() >= expirationTime
    },
}
