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
            'Authorization': `token ${token}`,
            'Referrer-Policy': 'no-referrer'
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

        const response = await request.json()
        return response
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
