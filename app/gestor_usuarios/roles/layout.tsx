'use client'

import { useContext, useRef, ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import AppContext from '@/context/appContext'

interface LayoutRolinPagesProps {
    children: ReactNode
}

const LayoutRolinPages: React.FC<LayoutRolinPagesProps> = ({ children }) => {
    //* context
    const { appState } = useContext(AppContext.Context)
    const { userInfo: _userInfo } = appState

    //* router
    const _router = useRouter()
    const _hasChecked = useRef(false)

    //* Redirection logic after initial render
    // useEffect(() => {
    //     if (!_hasChecked.current) {
    //         _hasChecked.current = true
    //         if (_userInfo.levelAccessRolIntitutional !== 'ROOT') {
    //             _router.push('/')
    //         }
    //     }
    //     // eslint-disable-next-line
    // }, [])

    return <>{children}</>
}

export default LayoutRolinPages
