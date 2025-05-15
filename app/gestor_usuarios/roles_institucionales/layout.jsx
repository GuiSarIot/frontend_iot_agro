'use client'

import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppContext from '@/context/appContext'

const LayoutRolinPages = ({ children }) => {
    //* context
    const { appState } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* router
    const router = useRouter()

    //* Redirection logic after initial render
    useEffect(() => {
        if (userInfo.levelAccessRolIntitutional !== 'ROOT') {
            router.push('/')
        }
    }, [userInfo.levelAccessRolIntitutional, router]) // Dependencias para ejecutar el efecto cuando cambien

    return children
}

export default LayoutRolinPages
