import GetRoute from '@/components/protectedRoute/getRoute'

interface ConsumerAPIFormDataParams {
    url: string
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string
    headers?: Record<string, string>
    body: FormData
}

interface ConsumerAPIResponse<T = unknown> {
    status: 'success' | 'error'
    message: string
    data: T
}

const ConsumerAPIFormData = async <T = unknown>({
    url,
    method = 'POST',
    headers = {},
    body
}: ConsumerAPIFormDataParams): Promise<ConsumerAPIResponse<T>> => {
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
            // No establecer Content-Type para FormData
            // El navegador lo establece automáticamente con el boundary correcto
            'Authorization': `Bearer ${token}`
        },
        body
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

export default ConsumerAPIFormData