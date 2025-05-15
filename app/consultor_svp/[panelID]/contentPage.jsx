'use client'

import { useState, useEffect } from 'react'
import { useContext } from 'react'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'

const ContentPage = ({ params }, {
    infoPage={
        route: '/consultor_svp/'
    }
}) => {

    //* context
    const { appState, showNavbar, changeTitle, showLoader } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* states
    const [link, setLink] = useState('')
    const [infoPanel, setInfoPanel] = useState({})
    const { panelID } = params

    //* effects
    useEffect(() => {
        showLoader(true)
        window.innerWidth <= 1380 ? showNavbar(false) : showNavbar(true)
        loadInfoPanel()
        showLoader(false)
    }, [])

    useEffect(() => {
        if (Object.keys(infoPanel).length > 0) {
            loadConsultantInfo()
        }
    }, [infoPanel])

    //* methods
    const loadInfoPanel = async () => {
        const { data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/consultor_svp/panel_info/${panelID}` })
        changeTitle(data.name)
        SaveRoute({
            title: data.name,
            routeInfo: `${infoPage.route}${panelID}`,
        })
        setInfoPanel(data)
        registerVisit('Indicativa - Formulario de creación de grupos fichas')
    }

    const registerVisit = async (moduleName) => {
        const {status, message} = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/contador_visitas_modulo/registrar/${userInfo.id}`,
            method: 'POST',
            body: {
                rolName: userInfo.role,
                moduleName
            }
        })

        if (status == 'error') {
            console.log(message)
        }
    }

    const loadConsultantInfo = async () => {
        const { data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/consultor_svp/consultor_info/${userInfo.id}` })
        const { typeConsultant, centers, idCenter, regionCenters } = data

        let link = infoPanel.link

        if (! link.includes('filter')) {
            setLink(link)
            return false
        }

        if (typeConsultant == 'Nacional') {
            link = link + ' in ()'
        }

        if (typeConsultant == 'Regional') {
            link = link + ` in (${regionCenters})`
        }

        if (typeConsultant == 'Centro') {
            link = link + ` in (${idCenter})`
        }

        if (typeConsultant == 'Especial') {
            link = link + ` in (${idCenter},${centers})`
        }

        setLink(link)
    }

    //* renders
    return (
        <div>
            <iframe
                src={link}
                allowFullScreen={true}
            ></iframe>
        </div>
    )
}

ContentPage.propTypes = {
    params: PropTypes.object.isRequired
}

export default ContentPage