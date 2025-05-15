'use server'

import { cookies } from 'next/headers'

const SaveRoute = ({ routeInfo, title, isLogged, user, role, token }) => {
    const cooki = cookies()

    const options = {
        maxAge: 3 * 24 * 60 * 60,
        path: '/',
        httpOnly: true
    }

    if (routeInfo) {
        cooki.set('route', routeInfo, options)
    }

    if (title) {
        cooki.set('title', title, options)
    }

    if (isLogged) {
        cooki.set('isLogged', isLogged, options)
    }

    if (user) {
        cooki.set('user', user, options)
    }

    if (role) {
        cooki.set('role', role, options)
    }

    if (token) {
        cooki.set('token', token, options)
    }
    
}

export default SaveRoute