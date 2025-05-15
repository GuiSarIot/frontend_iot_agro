'use client'

import { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import AppContext from '@/context/appContext'
import MainForm from '@/components/shared/mainForm/mainForm'
import stylesMainForm from '@/components/shared/mainForm/mainform.module.css'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import InputForm from '@/components/shared/inputForm/inputForm'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import GenerateCSV from '@/components/shared/generateCSV/genertateCSV'


const ContentPage = ({
    infoPage ={
        title: 'Aprendices - Alternativas de etapas productivas registradas',   
        route: '/reportes_sofia/aprendices/alternativas_ep_registradas',        
    }
}) => {

    //* context
    const { changeTitle, showNavbar, showLoader, appState } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* states
    const [inputsValues, setInputsValues] = useState({
        tokenCodes: '',
        centerCode: '',
    })

    //* effects
    useEffect(() => {
        showLoader(true)
        window.innerWidth <= 1380 ? showNavbar(false) : showNavbar(true)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title,
        })
        loadUserInfo()
        showLoader(false)   
    }, [])


    //* methods
    const loadUserInfo = async () => {
        const { data, status, message } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/reportes_sofia/info_usuario/${userInfo.id}` })

        if (status === 'error') {
            console.log(message)
            showLoader(false)
            return false
        }

        setInputsValues({
            ...inputsValues,
            centerCode: data.userCenter
        })
    }   

    const handleBlur = (value) => {
        const regex = /^(\d+(,\s*\d+)*)?$/
        if (!regex.test(value)) {
            Swal.fire({
                title: 'Error',
                text: 'Ingrese solo números separados por comas',
                icon: 'error'
            })
        }
    }

    const onSuccesForm = (message, data) => {
        const stateCsv = GenerateCSV({
            data,
            fileName: 'reporte_alternativas_ep_registradas',
            textSuccess: 'Reporte de alternativas EP generado',
            textErrorEmpty: 'No se hayan registros disponibles para las fichas ingresadas'
        })

        if (stateCsv) {
            setInputsValues({
                ...inputsValues,
                tokenCodes: ''
            })
        }
    }

    const onErrorForm = () => {
        Swal.fire({
            title: 'Upss...',
            text: 'Ocurrio un error al generar el reporte',
            icon: 'error'
        })
    }


    //* renders
    return (
        <>
            <MainForm submitText="Generar reporte" inputsValues={inputsValues} url={`${process.env.NEXT_PUBLIC_API_URL}/reportes_sofia/aprendices/alternativas_ep_registradas`} method="POST" onSuccesResponse={onSuccesForm} onErrorResponse={onErrorForm} loader={true}>

                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2>Funcionalidad</h2>
                        <div className={stylesMainForm.descriptionSection}>
                            <p> En este módulo podrá generar el reporte de etapa productiva de las alternativas de etapa productiva Aprendices de formación titulada. Por lo tanto, deberá digitar los códigos de las fichas, separados por comas. <br /> <span>Ejemplo: 123456, 654321, 678901</span></p>
                            <p> <span>Nota</span>: La base de datos permite consultar máximo 1000 códigos de fichas por reporte.</p>
                        </div>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm label="Códigos de fichas*" required={true} type="text" name="tokenCodes" valueProp={inputsValues.tokenCodes} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues,
                            onBlur: handleBlur
                        }} />
                    </div>
                </section>

            </MainForm>
        </>
    )
}

ContentPage.propTypes = {
    infoPage: PropTypes.object
}

export default ContentPage