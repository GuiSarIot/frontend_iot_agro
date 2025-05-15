'use client'

import SaveRoute from '@/components/protectedRoute/saveRoute'

const Logout = async ({ changeAuthContext, changeUserInfo, router }) => {

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
}

export default Logout