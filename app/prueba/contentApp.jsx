'use client'

import { useContext } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import Content from '@/components/shared/content/content'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import AppContext from '@/context/appContext'

const ContentApp = ({ children }) => {

    //* context
    const { appState } = useContext(AppContext.Context)

    //* renders
    return (
        <ProtectedRoute>
            <>
                <SideBarLeft>
                    <li className={stylesSideBar.title}><h3>Titulo de prueba</h3></li>
                    <li className={stylesSideBar.item}><Link href="#">Link de prueba 1</Link></li>
                    <li className={stylesSideBar.item}><Link href="#">Link de prueba 2</Link></li>
                    <li className={stylesSideBar.item}><Link href="#">Link de prueba 3</Link></li>
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