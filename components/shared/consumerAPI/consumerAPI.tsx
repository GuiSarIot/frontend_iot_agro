import GetRoute from '@/components/protectedRoute/getRoute'

interface ConsumerAPIParams {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | string
    headers?: Record<string, string>
    body?: Record<string, unknown>
}

interface ConsumerAPIResponse<T = unknown> {
    status: 'success' | 'error'
    message: string
    data: T
}

const ConsumerAPI = async <T = unknown>({
    url,
    method = 'GET',
    headers = {},
    body = {}
}: ConsumerAPIParams): Promise<ConsumerAPIResponse<T>> => {
    const { token } = await GetRoute()

    if (!token || token === 'false' || token.trim() === '') {
        return {
            status: 'error',
            message: 'Token is not valid',
            data: [] as never
        }
    }

    const params: RequestInit = {
        method,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    if (method !== 'GET') {
        params.body = JSON.stringify(body)
    }

    try {
        const request = await fetch(url, params)

        if (!request.ok) {
            const errorResponse = await request.json().catch(() => ({}))
            return {
                status: 'error',
                message: `Error ${request.status}: ${request.statusText}`,
                data: errorResponse
            }
        }

        // Manejar respuestas sin contenido (204 No Content)
        if (request.status === 204 || request.headers.get('content-length') === '0') {
            return {
                status: 'success',
                message: 'Request successful',
                data: {} as T
            }
        }

        // Intentar parsear JSON solo si hay contenido
        const contentType = request.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            return {
                status: 'success',
                message: 'Request successful',
                data: {} as T
            }
        }

        const response = await request.json()
        
        // Si la respuesta ya tiene un campo 'status', úsala tal cual
        if (response && typeof response === 'object' && 'status' in response) {
            return response
        }
        
        // Si no, envolver la respuesta con status success
        return {
            status: 'success',
            message: 'Request successful',
            data: response
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return {
            status: 'error',
            message: `Network error: ${errorMessage}`,
            data: [] as never
        }
    }
}

export default ConsumerAPI
