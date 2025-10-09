'use client'

import { useContext, FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'

import GetRoute from '@/components/protectedRoute/getRoute'
import Logout from '@/components/protectedRoute/logout'
import AppContext from '@/context/appContext'

import stylesMainForm from './mainform.module.css'

interface MainFormProps {
    children?: React.ReactNode
    submitText?: string
    inputsValues: Record<string, unknown>
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    onSuccesResponse: <T = unknown>(message: string, data?: T) => void
    onErrorResponse: (message: string) => void
    headers?: Record<string, string>
    onValidate?: () => boolean
    onSecondFunctionality?: (args: { url: string; inputsValues: Record<string, unknown> }) => void
    loader?: boolean
    showSubmitButtom?: boolean
    debug?: boolean
}

const MainForm: React.FC<MainFormProps> = ({
    children,
    submitText = 'Enviar',
    inputsValues,
    url,
    method,
    onSuccesResponse,
    onErrorResponse,
    headers = {},
    onValidate,
    onSecondFunctionality,
    loader = true,
    showSubmitButtom = true,
    debug = false,
}) => {
    const { changeAuthContext, changeUserInfo } = useContext(AppContext.Context)
    const router = useRouter()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (debug) {
            console.log(inputsValues)
            return
        }

        if (onSecondFunctionality) {
            onSecondFunctionality({ url, inputsValues })
            return
        }

        if (onValidate && !onValidate()) {
            return
        }

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
                },
            })
        }

        try {
            console.time('Obtención del Token')
            const { token } = await GetRoute()
            console.timeEnd('Obtención del Token')

            if (!token || token === 'false' || token.trim() === '') {
                onErrorResponse('Token inválido o expirado')
                Logout({ changeAuthContext, changeUserInfo, router })
                return
            }

            console.time('Fetch Request')
            const request = await fetch(url, {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                    Authorization: `token ${token}`,
                    'Referrer-Policy': 'no-referrer',
                },
                body: JSON.stringify(inputsValues),
            })
            console.timeEnd('Fetch Request')

            const jsonResponse = await request.json()
            const { status, message, data } = jsonResponse

            if (loader) {
                console.time('Cerrando Swal')
                Swal.close()
                console.timeEnd('Cerrando Swal')
            }

            if (status === 'error') {
                onErrorResponse(message)
                return
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

    return (
        <form className={stylesMainForm.mainForm} onSubmit={handleSubmit}>
            <div className={stylesMainForm.sectionFields}>{children}</div>
            <div className={stylesMainForm.sectionSubmit}>
                {showSubmitButtom && (
                    <input type="submit" value={submitText} className="btnSubmit" />
                )}
            </div>
        </form>
    )
}

export default MainForm
