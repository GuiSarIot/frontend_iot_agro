'use client'

import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'

import type {
    LoginRequestBody,
    LoginResponseData,
    EncryptedIdResponse,
    User,
    ConsumerAPIResult,
    GetRouteResult,
} from './auth.types'

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    'https://backendiot-production-9651.up.railway.app'
)
    .replace(/\/$/, '')
    .replace(/\/api$/, '')

export async function loginRequest(body: LoginRequestBody) {
    return (await ConsumerPublicAPI({
        url: `${API_BASE_URL}/api/auth/login/`,
        method: 'POST',
        body,
    })) as ConsumerAPIResult<LoginResponseData>
}

export async function getCurrentUser(token: string) {
    return (await ConsumerPublicAPI({
        url: `${API_BASE_URL}/api/users/me/`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })) as ConsumerAPIResult<User>
}

export async function encryptUserId(id: string, token: string) {
    const res = (await ConsumerPublicAPI({
        url: `${API_BASE_URL}/api/login/cifrar_id/${id}/`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })) as ConsumerAPIResult<EncryptedIdResponse>
    return res.data.encrypted_id
}

export async function saveRoute(params: Parameters<typeof SaveRoute>[0]) {
    return SaveRoute(params)
}

export async function getRoute() {
    return (await GetRoute()) as GetRouteResult
}