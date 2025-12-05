'use client'

import { ReactNode } from 'react'

import Link from 'next/link'

import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import Content from '@/components/shared/content/content'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import { useAppContext } from '@/context/appContext'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    // * context
    const { appState } = useAppContext()
    const { userInfo } = appState

    // * renders
    return (
        <ProtectedRoute>
            <>
                <SideBarLeft>
                    <li className={stylesSideBar.title}>
                        <h3>Gestión de usuarios</h3>
                    </li>
                    <li className={stylesSideBar.item}>
                        <Link href="/gestor_usuarios/crear">Nuevo Usuario</Link>
                    </li>
                    <li className={stylesSideBar.item}>
                        <Link href="/gestor_usuarios">Listado de usuarios</Link>
                    </li>
                </SideBarLeft>
                <Content title={appState.title}>
                    {children}
                </Content>
            </>
        </ProtectedRoute>
    )
}

export default ContentApp