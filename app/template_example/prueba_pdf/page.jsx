'use client'

import { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import styledPage from './mainPage.module.css'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'

const TestPdf = ({
    infoPage = {
        title: 'Prueba PDF',
        route: '/prueba_pdf'
    }
}) => {
    const { appState, showNavbar, showLoader, changeTitle, changeUserInfo } = useContext(AppContext.Context)
    const { userInfo } = appState
    
    useEffect(() => {
        showLoader(false)
        window.innerWidth <= 1380 ? showNavbar(false) : showNavbar(true)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title,
            role: ''
        })
        changeUserInfo({
            ...userInfo,
            role: ''
        })
    }, [])


    const handleTest = async () => {
        const response = await ConsumerAPI({url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_reportes/loadCenters/`})
        console.log(response)
    }

    return (
        <div className={styledPage.content}>      
            <button onClick={handleTest}>
                Test me
            </button>
        </div>
    )
}

TestPdf.propTypes = {
    infoPage: PropTypes.object
}

export default TestPdf
