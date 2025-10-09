'use client'

import { ReactNode, FC, useContext } from 'react'

import Link from 'next/link'

import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import Content from '@/components/shared/content/content'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import AppContext from '@/context/appContext'

interface ContentAppProps {
    children?: ReactNode
}

const ContentApp: FC<ContentAppProps> = ({ children }) => {

    //* context
    const { appState } = useContext(AppContext.Context)

    //* renders
    return (
        <ProtectedRoute>
            <>
                <SideBarLeft>
                    <li className={stylesSideBar.title}><h3>Generación PDF</h3></li>
                    <li className={stylesSideBar.item}>
                        <Link href="/prueba_pdf">Inicio prueba</Link>
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
