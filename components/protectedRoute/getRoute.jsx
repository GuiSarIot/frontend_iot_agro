'use server'

import { cookies } from 'next/headers'

const GetRoute = async () => {
    const cooki = cookies()

    const route = cooki.get('route') ? cooki.get('route').value : undefined
    const title = cooki.get('title') ? cooki.get('title').value : undefined
    const isLogged = cooki.get('isLogged') ? cooki.get('isLogged').value : undefined
    const user = cooki.get('user') ? cooki.get('user').value : undefined
    const role = cooki.get('role') ? cooki.get('role').value : undefined
    const token = cooki.get('token') ? cooki.get('token').value : undefined

    return {
        route,
        title,
        isLogged,
        user,
        role,
        token
    }
}

export default GetRoute