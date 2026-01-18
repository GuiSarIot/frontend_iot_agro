'use client'

import { ensureValidToken } from './refresh-token.service'
import { tokenService } from './token.service'

export interface AuthenticatedRequestOptions extends Omit<RequestInit, 'body'> {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
}

/**
 * Realiza una petición HTTP autenticada con el token JWT
 * Automáticamente añade el header Authorization y refresca el token si es necesario
 */
export async function authenticatedFetch<T = unknown>(
    options: AuthenticatedRequestOptions
): Promise<T> {
    const { url, method = 'GET', body, headers = {}, ...restOptions } = options

    // Asegurar que tenemos un token válido
    const token = await ensureValidToken()

    if (!token) {
        // Limpiar tokens y redirigir al login
        tokenService.clearTokens()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
    }

    // Preparar headers
    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...headers,
    }

    // Preparar opciones de la petición
    const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        ...restOptions,
    }

    // Añadir body si existe y no es GET
    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(url, fetchOptions)

        // Si el token es inválido (401), limpiar tokens y redirigir al login
        if (response.status === 401) {
            tokenService.clearTokens()
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
            throw new Error('Sesión expirada')
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            
            // Extraer mensaje de error más específico
            let errorMessage = `Error HTTP: ${response.status}`
            
            if (errorData.detail) {
                errorMessage = errorData.detail
            } else if (errorData.message) {
                errorMessage = errorData.message
            } else if (errorData.error) {
                errorMessage = errorData.error
            } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                // Si hay errores de campo específicos
                const fieldErrors = Object.entries(errorData)
                    .map(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            return `${field}: ${messages.join(', ')}`
                        }
                        return `${field}: ${messages}`
                    })
                    .join('. ')
                if (fieldErrors) {
                    errorMessage = fieldErrors
                }
            }
            
            throw new Error(errorMessage)
        }

        // Manejar respuestas vacías (204 No Content, DELETE, etc.)
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        
        // Si no hay contenido o es 204, retornar objeto vacío
        if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
            return {} as T
        }

        // Intentar parsear JSON solo si hay contenido
        const text = await response.text()
        if (!text || text.trim().length === 0) {
            return {} as T
        }

        return JSON.parse(text) as T
    } catch (error) {
        console.error('Error en petición autenticada:', error)
        throw error
    }
}

/**
 * Función helper para peticiones GET autenticadas
 */
export async function authenticatedGet<T = unknown>(url: string): Promise<T> {
    return authenticatedFetch<T>({ url, method: 'GET' })
}

/**
 * Función helper para peticiones POST autenticadas
 */
export async function authenticatedPost<T = unknown>(
    url: string,
    body: unknown
): Promise<T> {
    return authenticatedFetch<T>({ url, method: 'POST', body })
}

/**
 * Función helper para peticiones PUT autenticadas
 */
export async function authenticatedPut<T = unknown>(url: string, body: unknown): Promise<T> {
    return authenticatedFetch<T>({ url, method: 'PUT', body })
}

/**
 * Función helper para peticiones PATCH autenticadas
 */
export async function authenticatedPatch<T = unknown>(
    url: string,
    body: unknown
): Promise<T> {
    return authenticatedFetch<T>({ url, method: 'PATCH', body })
}

/**
 * Función helper para peticiones DELETE autenticadas
 */
export async function authenticatedDelete<T = unknown>(url: string): Promise<T> {
    return authenticatedFetch<T>({ url, method: 'DELETE' })
}
