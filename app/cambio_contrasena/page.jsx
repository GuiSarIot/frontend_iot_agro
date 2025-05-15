'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useContext, useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import AppContext from '@/context/appContext'

import InputForm from '@/components/shared/inputForm/inputForm'
import MainForm from '@/components/shared/mainForm/mainForm'
import StyleMainForm from '@/components/shared/mainForm/mainform.module.css'

import CloudSyncIcon from '@mui/icons-material/CloudSync'
import Alert from '@mui/material/Alert'
import stylesPage from './stylesPage.module.css'

const ResetPasswordForm = () => {
    const { changeTitle, showNavbar, showLoader } = useContext(AppContext.Context)

    useEffect(() => {
        showLoader(true)
        if (typeof window !== 'undefined') {
            showNavbar(window.innerWidth > 1380)
        }
        changeTitle('Cambiar contraseña')
        showLoader(false)
    }, [])

    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams?.get('token') || ''
    const email = searchParams?.get('email') || ''

    const [inputValues, setInputValues] = useState({})
    const [error, setError] = useState('')

    const validatePassword = () => {
        const { newPassword, confirmPassword } = inputValues

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&#^()_+~])[A-Za-z\d.@$!%*?&#^()_+~]{8,}$/

        if (!newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios.')
            return false
        }

        if (!passwordRegex.test(newPassword)) {
            setError(
                'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos especiales (permitidos .,@,$,!,%,*,?,&,#,^,(,),_,+,~).'
            )
            return false
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return false
        }

        setError('')
        return true
    }

    const handleSubmit = async () => {
        if (!validatePassword()) return

        try {
            Swal.fire({
                title: 'Procesando...',
                text: 'Por favor espere mientras se actualiza la contraseña.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            const { status, message } = await ConsumerPublicAPI({
                url: `${process.env.NEXT_PUBLIC_API_URL}/reset-password`,
                method: 'POST',
                body: {
                    ...inputValues,
                    token,
                    us_email_institucional: email
                }
            })

            Swal.close()

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message ?? 'Ha ocurrido un error, por favor intente de nuevo'
                })
                return
            }

            Swal.fire({
                icon: 'success',
                title: 'Contraseña Actualizada',
                text: 'La contraseña ha sido actualizada exitosamente',
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
                timerProgressBar: true,
            }).then(() => {
                router.push('/login')
            })

        } catch (error) {
            setError('Error al procesar la solicitud. Intente nuevamente.')
            console.error(error)
        }
    }

    return (
        <div className={stylesPage.container}>
            <div className={stylesPage.form}>
                <h3 className={StyleMainForm.sectionTitle}>
                    Restaurar contraseña <CloudSyncIcon style={{ color: 'green' }} />
                </h3>
                <p>Por favor, ingrese su nueva contraseña...</p>

                <MainForm showSubmitButtom={false} specialConf={{ valueState: inputValues, setValueState: setInputValues }}>
                    <InputForm
                        type="password"
                        name="newPassword"
                        label="Nueva Contraseña"
                        specialConf={{ valueState: inputValues, setValueState: setInputValues }}
                        styles={{ width: '90%' }}
                    />

                    <InputForm
                        type="password"
                        name="confirmPassword"
                        label="Confirmar Contraseña"
                        specialConf={{ valueState: inputValues, setValueState: setInputValues }}
                        styles={{ width: '90%', marginBottom: '1rem' }}
                    />
                </MainForm>

                {error && <Alert severity="error">{error}</Alert>}

                <div className={stylesPage.containerButton}>
                    <button className={stylesPage.buttonSubmit} onClick={handleSubmit}>
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    )
}

const PageLogin = () => {
    return (
        <Suspense
            fallback={
                <div className={stylesPage.loadingContainer}>
                    <p>Cargando formulario...</p>
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    )
}

export default PageLogin
