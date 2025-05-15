'use client'

import { useContext } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import Content from '@/components/shared/content/content'
import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import AppContext from '@/context/appContext'

const ContentApp = ({ children }) => {

    //* context
    const { appState } = useContext(AppContext.Context)

    //* renders
    return (
        <ProtectedRoute>
            <>
                <SideBarLeft>
                    <li className={stylesSideBar.title}><h3>Generación pdf</h3></li>
                    <li className={stylesSideBar.item}><Link href="/prueba_pdf">Inicio preba</Link></li>
                </SideBarLeft>
                <Content title={appState.title}>
                    {children}
                </Content>
            </>
        </ProtectedRoute>
    )
}

ContentApp.propTypes = {
    children: PropTypes.node
}

export default ContentApp