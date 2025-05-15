'use client'

import { useContext, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import PropTypes from 'prop-types'
import SaveRoute from './saveRoute'
import GetRoute from './getRoute'
import consumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import AppContext from '@/context/appContext'

const ProtectedRoute = ({ children }) => {
    const { appState, changeUserInfo, changeAuthContext } = useContext(AppContext.Context)
    const { authContext } = appState
    const router = useRouter()
    const currentUrl = usePathname()

    useEffect(() => {
        loadUserInfo()
    }, [])

    const loadUserInfo = async () => {
        const { isLogged, route, user, title, role } = await GetRoute()

        if (!isLogged || !user) {
            SaveRoute({ isLogged: 'false', user: 'false', token: 'false' })
            router.push('/login')
            return
        }

        const { data, status } = await consumerPublicAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/login/userInfo/${user}` })

        if (status === 'error') {

            //* login out
            changeAuthContext({
                token: '',
                user: null,
                isLoggedIn: false,
                isLoading: false,
                isError: false,
            })

            changeUserInfo({
                name: '',
                email: '',
                role: '',
                module: null,
                hasRolIntitutional: null,
                nameRolIntitutional: null,
                levelAccessRolIntitutional: null,
                nameImage: null,
            })

            SaveRoute({
                routeInfo: '/login',
                title: 'Login',
                isLogged: 'false',
                user: 'false',
                token: 'false',
                role: 'false'
            })

            router.push('/login')
            return
        }

        // Actualizamos el estado del usuario con la información obtenida
        updateUserInfo(data, title, role)
        redirectUserBasedOnRole(data, route)
    }

    const updateUserInfo = (data, title, role) => {
        changeUserInfo({
            name: data.name,
            email: data.email,
            role: title === 'Login' ? data.role.role : role,
            module: data.module,
            id: data.id,
            roles: data.roles,
            hasRolIntitutional: data.has_rol_intitutional,
            nameRolIntitutional: data.rol_intitutional,
            levelAccessRolIntitutional: data.rol_intitutional_level_access,
            nameImage: data.name_image
        })

        changeAuthContext({
            token: '',
            user: '',
            isLoggedIn: true,
            isLoading: false,
            isError: false,
        })
    }

    const redirectUserBasedOnRole = (data, route) => {
        setTimeout(() => {
            if (validateRolsUser(data.roles)) {
                router.push(currentUrl)
            } else {
                router.push(route)
            }
        }, 500)
    }

    const validateRolsUser = (roles) => {
        const roleUrl = currentUrl.split('/')[1]
        return roles.some(rol => rol.url === roleUrl)
    }

    if (!authContext.isLoggedIn) {
        return null
    }

    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    autoRedirection: PropTypes.bool
}

export default ProtectedRoute
