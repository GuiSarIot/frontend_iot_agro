'use client'

import { ReactNode, useContext, MouseEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import Content from '@/components/shared/content/content'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import AppContext from '@/context/appContext'

// Props tipadas
interface ContentAppProps {
    children?: ReactNode
}

const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    //* context
    const { appState } = useContext(AppContext.Context)

    //* hooks
    const router = useRouter()

    //* handlers
    const handleLink = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        router.back()
    }

    //* renders
    return (
        <ProtectedRoute>
            <>
                <SideBarLeft>
                    <li className={stylesSideBar.title}>
                        <h3>Edición información personal</h3>
                    </li>
                    <li className={stylesSideBar.item}>
                        <Link onClick={handleLink} href="/">
                            Volver
                        </Link>
                    </li>
                </SideBarLeft>
                <Content title={appState.title}>{children}</Content>
            </>
        </ProtectedRoute>
    )
}

export default ContentApp
