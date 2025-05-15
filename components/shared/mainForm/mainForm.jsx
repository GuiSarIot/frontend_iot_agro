'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import GetRoute from '@/components/protectedRoute/getRoute'
import Logout from '@/components/protectedRoute/logout'
import Swal from 'sweetalert2'
import stylesMainForm from './mainform.module.css'

const MainForm = ({ children, submitText, inputsValues, url, method, onSuccesResponse, onErrorResponse, headers = {}, onValidate, onSecondFunctionality, loader = true, showSubmitButtom = true, debug }) => {
    //* context
    const { changeAuthContext, changeUserInfo } = useContext(AppContext.Context)

    //* hooks
    const router = useRouter()

    //* methods
    const handleSubmit = async (event) => {
        event.preventDefault()

        //* debug
        if (debug) {
            console.log(inputsValues)
            return false
        }

        //* execute the second funcionality
        if (onSecondFunctionality) {
            onSecondFunctionality({ url, inputsValues })
            return false
        }

        //* validate function before to send or process data
        if (onValidate) {
            if (!onValidate()) {
                return false
            }
        }

        //* Show loader
        if (loader) {
            console.time('Tiempo de Loader')
            Swal.fire({
                title: 'Cargando...',
                text: 'Espere un momento por favor',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                didOpen: () => {
                    Swal.showLoading()
                }
                // onBeforeOpen: () => {
                //     Swal.showLoading()
                // }
            })
        }

        try {
            //* Get token
            console.time('Obtención del Token')
            const { token } = await GetRoute()
            console.timeEnd('Obtención del Token')
            if (token === undefined || token === null || token === 'false' || token.trim() === '') {
                onErrorResponse('Token inválido o expirado')

                //* login out
                Logout({
                    changeAuthContext,
                    changeUserInfo,
                    router
                })

                return false
            }

            //* Send request
            console.time('Fetch Request')
            const request = await fetch(url, {
                method: method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                    'Authorization': `token ${token}`,
                    'Referrer-Policy': 'no-referrer',
                },
                body: JSON.stringify(inputsValues)
            })
            console.timeEnd('Fetch Request')

            //* Get response
            const { status, message, data } = await request.json()

            //* Close loader
            if (loader) {
                console.time('Cerrando Swal')
                Swal.close()
                console.timeEnd('Cerrando Swal')
            }

            if (status === 'error') {
                onErrorResponse(message)
                return false
            }

            onSuccesResponse(message, data)
        } catch (error) {
            if (loader) Swal.close()
            console.error('Error en la solicitud:', error)
            onErrorResponse('Error al realizar la solicitud')
        } finally {
            if (loader) console.timeEnd('Tiempo de Loader')
        }
    }

    //* renders
    return (
        <form className={stylesMainForm.mainForm} onSubmit={handleSubmit}>
            <div className={stylesMainForm.sectionFields}>
                {children}
            </div>
            <div className={stylesMainForm.sectionSubmit}>
                {showSubmitButtom && <input type="submit" value={submitText} className="btnSubmit" />}
            </div>
        </form>
    )
}

MainForm.propTypes = {
    children: PropTypes.node,
    submitText: PropTypes.string,
    inputsValues: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    onSuccesResponse: PropTypes.func.isRequired,
    onErrorResponse: PropTypes.func.isRequired,
    headers: PropTypes.object,
    onValidate: PropTypes.func,
    onSecondFunctionality: PropTypes.func,
    loader: PropTypes.bool,
    showSubmitButtom: PropTypes.bool,
    debug: PropTypes.bool
}

export default MainForm