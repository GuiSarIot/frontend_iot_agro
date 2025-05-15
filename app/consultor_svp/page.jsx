'use client'

import { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import stylesPage from './mainPage.module.css'

const ConsultantSVP = ({
    infoPage ={
        title: 'Consultor SVP',   
        route: '/consultor_svp',
        role:'Consultor Paneles PBI'         
    }
}) => {

    //* context
    const { appState, showNavbar, showLoader, changeTitle, changeUserInfo } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* effects
    useEffect(() => {
        showLoader(true)
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
        // showLoader(false)
    }, [])

    
    return (
        <div className={stylesPage.content}>
            <h2>Seleccione un panel en la sección de <span>categorías paneles</span></h2>

        </div>
    )
}

ConsultantSVP.propTypes = {
    infoPage: PropTypes.object
}

export default ConsultantSVP