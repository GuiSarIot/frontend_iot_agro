'use server'

import { cookies } from 'next/headers'

interface RouteData {
    route?: string
    title?: string
    isLogged?: string
    user?: string
    role?: string
    token?: string
    }

const GetRoute = async (): Promise<RouteData> => {
    const cooki = cookies()

    const route = cooki.get('route')?.value
    const title = cooki.get('title')?.value
    const isLogged = cooki.get('isLogged')?.value
    const user = cooki.get('user')?.value
    const role = cooki.get('role')?.value
    const token = cooki.get('token')?.value

    return {
        route,
        title,
        isLogged,
        user,
        role,
        token,
    }
}

export default GetRoute