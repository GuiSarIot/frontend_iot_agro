'use client'

import { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import Content from '@/components/shared/content/content'
import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import SubMenu from '@/components/shared/sideBarLeft/submenu/subMenu'
import AppContext from '@/context/appContext'

const ContentApp = ({ children }) => {

    //* context
    const { appState } = useContext(AppContext.Context)

    //* states
    const [formsList] = useState({
        'Aprendices': [
            { id: 1, formNombre: 'Etapa productiva', url: 'aprendices/etapa_productiva' },
            { id: 2, formNombre: 'Alternativas de etapas productivas registradas', url: 'aprendices/alternativas_ep_registradas' }
        ]
    })

    //* renders
    const generateMenu = (data) => {
        return Object.entries(data).map(([category, formSofia]) => (
            <li key={category} className={stylesSideBar.subMenu}>
                <SubMenu textButton={category} Icon={BubbleChartIcon}>
                    {formSofia.map((formInfo) => (
                        <li key={formInfo.id} className={stylesSideBar.subMenuItem}>
                            <Link href={`/reportes_sofia/${formInfo.url}`}>{formInfo.formNombre}</Link>
                        </li>
                    ))}
                </SubMenu>
            </li>
        ))
    }
    
    return (
        <ProtectedRoute>
            <>
                <SideBarLeft>
                    {Object.entries(formsList).length > 0 && (
                        <>
                            <li className={stylesSideBar.title}><h3>Formularios de reportes</h3></li>
                            {generateMenu(formsList)}
                        </>
                    )}
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