'use client'

import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'

import type {
    LoginRequestBody,
    LoginResponseData,
    ConsumerAPIResult,
    GetRouteResult,
} from './auth.types'

export async function loginRequest(body: LoginRequestBody) {
    return (await ConsumerPublicAPI({
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
        method: 'POST',
        body,
    })) as ConsumerAPIResult<LoginResponseData>
}

export async function encryptUserId(id: string) {
    const res = (await ConsumerPublicAPI({
        url: `${process.env.NEXT_PUBLIC_API_URL}/login/cifrar_id/${id}`,
    })) as ConsumerAPIResult<string>
    return res.data
}

export async function saveRoute(params: Parameters<typeof SaveRoute>[0]) {
    return SaveRoute(params)
}

export async function getRoute() {
    return (await GetRoute()) as GetRouteResult
}