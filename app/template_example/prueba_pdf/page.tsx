'use client'

import { useEffect } from 'react'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import { useAppContext } from '@/context/appContext'
import { UserInfo } from '@/context/types/app.types'

import styledPage from './mainPage.module.css'

interface TestPdfProps {
    infoPage?: {
        title: string
        route: string
    }
}

const TestPdf: React.FC<TestPdfProps> = ({
    infoPage = { title: 'Prueba PDF', route: '/prueba_pdf' }
}) => {
    const { appState, showNavbar, showLoader, changeTitle, changeUserInfo } =
        useAppContext()
    const { userInfo } = appState

    useEffect(() => {
        showLoader(false)
        if (window.innerWidth <= 1380) {
            showNavbar(false)
        } else {
            showNavbar(true)
        }
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title,
            role: ''
        })
        changeUserInfo({
            ...userInfo,
            role: ''
        } as Partial<UserInfo>)
    }, [
        showLoader,
        showNavbar,
        changeTitle,
        infoPage.route,
        infoPage.title,
        changeUserInfo,
        userInfo
    ])

    const handleTest = async () => {
        const response = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_reportes/loadCenters/`
        })
        console.log(response)
    }

    return (
        <div className={styledPage.content}>
            <button onClick={handleTest}>Test me</button>
        </div>
    )
}

export default TestPdf
