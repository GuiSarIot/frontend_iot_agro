export interface ConsumerAPIParams {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    body?: unknown
}

export interface ConsumerAPIResponse<T = unknown> {
    status: 'success' | 'error'
    message?: string
    data: T
    error?: unknown
}

/**
 * 🔗 Función global para consumir APIs públicas
 * - Maneja métodos GET, POST, PUT, DELETE, PATCH
 * - Devuelve siempre un objeto tipado { status, message, data }
 */
const consumerPublicAPI = async <T = unknown>({
    url,
    method = 'GET',
    headers = {},
    body = {},
}: ConsumerAPIParams): Promise<ConsumerAPIResponse<T>> => {
    const params: RequestInit = {
        method,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    }

    if (method !== 'GET') {
        params.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(url, params)

        // Si no hay éxito en la respuesta
        if (!response.ok) {
            const errorResponse = await response.json().catch(() => ({}))
            return {
                status: 'error',
                message: `Error ${response.status}: ${response.statusText}`,
                data: errorResponse as T,
                error: errorResponse,
            }
        }

        const jsonData = (await response.json().catch(() => ({}))) as T
        return {
            status: 'success',
            data: jsonData,
        }
    } catch (error) {
        const err = error as Error
        return {
            status: 'error',
            message: `Network error: ${err.message}`,
            data: [] as unknown as T,
        }
    }
}

export default consumerPublicAPI
