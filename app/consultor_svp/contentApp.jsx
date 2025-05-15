'use client'

import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import Content from '@/components/shared/content/content'
import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import SubMenu from '@/components/shared/sideBarLeft/submenu/subMenu'
import AppContext from '@/context/appContext'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'

const ContentApp = ({ children }) => {

    //* context
    const { appState, showLoader } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* state
    const [categories, setCategories] = useState([])
    const [categoriesPublic, setCategoriesPublic] = useState([])

    //* effects
    useEffect(() => {
        if (userInfo.id) {
            showLoader(true)
            loadCategoriesPublic()
            loadCategories()

        }
    }, [userInfo.id])


    const loadCategories = async () => {

        const { data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/consultor_svp/listar_categorias_paneles/${userInfo.id}` })

        setCategories(data)
        showLoader(false)
    }

    const loadCategoriesPublic = async () => {
        const { data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/consultor_svp/listar_categorias_paneles_publica` })

        setCategoriesPublic(data)
    }

    //* renders
    const generateMenu = (categories) => {
        return Object.entries(categories).map(([category, panels]) => (
            <li key={category} className={stylesSideBar.subMenu}>
                <SubMenu textButton={category} Icon={BubbleChartIcon}>
                    {panels.map((panel) => (
                        <li key={panel.id} className={stylesSideBar.subMenuItem}>
                            <Link href={`/consultor_svp/${panel.id}`}>{panel.pa_nombre}</Link>
                        </li>
                    ))}
                </SubMenu>
            </li>
        ))
    }

    const generateMenuPublic = (categoriesPublic) => {
        return Object.entries(categoriesPublic).map(([category, panels]) => (
            <li key={category} className={stylesSideBar.subMenu}>
                <SubMenu textButton={category} Icon={BubbleChartIcon}>
                    {panels.map((panel) => (
                        <li key={panel.id} className={stylesSideBar.subMenuItem}>
                            <Link href={`/consultor_svp/${panel.id}`}>{panel.pa_nombre}</Link>
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
                    {Object.entries(categories).length > 0 && (
                        <>
                            <li className={stylesSideBar.title}><h3>Categorías paneles</h3></li>
                            {generateMenu(categories)}

                        </>
                    )}
                    {Object.entries(categoriesPublic).length > 0 && (
                        <>

                            <li className={stylesSideBar.title}><h3>Categorías paneles públicos </h3></li>                            {generateMenuPublic(categoriesPublic)}
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
    children: PropTypes.node.isRequired
}

export default ContentApp