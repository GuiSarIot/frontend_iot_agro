'use client'

import { useContext, useEffect, ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import AppContext from '@/context/appContext'

interface LayoutRolinPagesProps {
    children: ReactNode
}

const LayoutRolinPages: React.FC<LayoutRolinPagesProps> = ({ children }) => {
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

    return <>{children}</>
}

export default LayoutRolinPages
