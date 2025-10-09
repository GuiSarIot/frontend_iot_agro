'use client'

import GetRoute from '@/components/protectedRoute/getRoute'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'

import type {
    RecoveryPasswordRequestBody,
    RecoveryPasswordRequestData,
    ConsumerAPIResult,
    GetRouteResult,
    SaveRouteParams,
} from './auth.types'

export async function loginRequest(body: RecoveryPasswordRequestBody) {
    return (await ConsumerPublicAPI({
        url: `${process.env.NEXT_PUBLIC_API_URL}/login/autenticar`,
        method: 'POST',
        body,
    })) as ConsumerAPIResult<RecoveryPasswordRequestData>
}

export async function encryptUserId(id: string) {
    const res = (await ConsumerPublicAPI({
        url: `${process.env.NEXT_PUBLIC_API_URL}/login/cifrarID/${id}`,
    })) as ConsumerAPIResult<string>
    return res.data
}

export async function saveRoute(params: SaveRouteParams) {
    return SaveRoute(params)
}

export async function getRoute() {
    return (await GetRoute()) as GetRouteResult
}