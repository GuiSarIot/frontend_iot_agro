'use client'

import { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import stylesPage from './contentApp.module.css'

const pruebasPage = ({
    infoPage = {
        title: 'Prueba',
        route: '/prueba',
        role: 'Prueba'
    }
}) => {

    //* context
    const { appState, showNavbar, changeTitle, changeUserInfo, showLoader } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* effects
    useEffect(() => {
        window.innerWidth <= 1380 ? showNavbar(false) : showNavbar(true)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title,
            role: infoPage.role
        })
        changeUserInfo({
            ...userInfo,
            role: infoPage.role
        })
        showLoader(false)
    }, [])


    return (
        <div className={stylesPage.content}>
            <h2>Lorem Ipsum is simply dummy text</h2>
        </div>
    )
}

pruebasPage.propTypes = {
    infoPage: PropTypes.object
}

export default pruebasPage