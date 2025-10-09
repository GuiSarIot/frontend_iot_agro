'use client'

import { useContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import CloudSyncIcon from '@mui/icons-material/CloudSync'
import Swal from 'sweetalert2'

import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import InputForm from '@/components/shared/inputForm/inputForm'
import MainForm from '@/components/shared/mainForm/mainForm'
import styleMainForm from '@/components/shared/mainForm/mainform.module.css'
import AppContext from '@/context/appContext'

import stylesPage from './stylesPage.module.css'

// Tipado del estado del formulario
interface InputValues {
    userType?: 'password' | 'numberDocument'
    loginName?: string
    numberDocument?: string
    [key: string]: unknown
}

const RecuperarContrasena: React.FC = () => {
    const [inputValues, setInputValues] = useState<InputValues>({})
    const router = useRouter()

    const { changeTitle, showNavbar, showLoader } = useContext(AppContext.Context)

    useEffect(() => {
        showLoader(true)

        if (window.innerWidth <= 1380) {
            showNavbar(false)
        } else {
            showNavbar(true)
        }

        changeTitle('Recuperar contraseña')
        showLoader(false)
    }, [changeTitle, showLoader, showNavbar])

    useEffect(() => {
        setInputValues((prevValues) => ({
            ...prevValues,
            numberDocument: '',
            loginName: '',
        }))
    }, [inputValues.userType])

    const recuperarDatos = async () => {
        const { userType, loginName, numberDocument } = inputValues

        if (!userType) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Seleccione qué desea recuperar: usuario o contraseña.',
            })
            return
        }

        if (userType === 'password' && !loginName) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ingrese su nombre de usuario.',
            })
            return
        }

        if (userType === 'numberDocument' && !numberDocument) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ingrese su número de documento.',
            })
            return
        }

        const url =
        userType === 'numberDocument'
            ? `${process.env.NEXT_PUBLIC_API_URL}/rememberUser`
            : `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`

        const body =
        userType === 'numberDocument'
            ? { userType, numberDocument }
            : { userType, loginName }

        try {
            Swal.fire({
                title: 'Procesando...',
                text: 'Por favor, espere mientras se procesa su solicitud.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

            const { status, message } = await ConsumerPublicAPI({
                url,
                method: 'POST',
                body,
            })

            Swal.close()

            if (status === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message || 'Ocurrió un error inesperado.',
                })
                return
            }

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text:
                userType === 'numberDocument'
                    ? 'Se ha enviado su nombre de usuario al correo registrado.'
                    : 'Se ha enviado un correo con instrucciones para recuperar su contraseña.',
                timer: 2500,
                showConfirmButton: true,
                allowOutsideClick: false,
                timerProgressBar: true,
            }).then(() => {
                router.push('/login')
            })
        } catch (error) {
            console.error('Error en recuperarDatos:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo procesar la solicitud.',
            })
        }
    }

    return (
        <div className={stylesPage.container}>
            <div className={stylesPage.form}>
                <h3 className={styleMainForm.sectionTitle}>
                ¿Qué deseas realizar? <CloudSyncIcon style={{ color: 'green' }} />
                </h3>
                <p>Recordar su usuario en el sistema o cambiar su contraseña</p>

                <section className={stylesPage.containerSelect}>
                    <button
                        className={`${stylesPage.buttontipo} ${
                            inputValues.userType === 'password' ? stylesPage.selected : ''
                        }`}
                        onClick={() =>
                            setInputValues((prev) => ({
                                ...prev,
                                userType: 'password',
                            }))
                        }
                    >
                        Contraseña
                    </button>

                    <button
                        className={`${stylesPage.buttontipo} ${
                            inputValues.userType === 'numberDocument' ? stylesPage.selected : ''
                        }`}
                        onClick={() =>
                            setInputValues((prev) => ({
                                ...prev,
                                userType: 'numberDocument',
                            }))
                        }
                    >
                        Usuario
                    </button>
                </section>

                <MainForm 
                    showSubmitButtom={false}
                    inputsValues={inputValues}
                    url={`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`}
                    method="POST"
                    onSuccesResponse={(message, data) => {
                        console.log('Éxito:', message, data)
                    }}
                    onErrorResponse={(message) => {
                        console.error('Error:', message)
                    }}
                >
                    {inputValues.userType === 'password' ? (
                        <InputForm
                            type="text"
                            name="loginName"
                            label="Usuario"
                            required
                            specialConf={{
                                valueState: inputValues,
                                setValueState: setInputValues,
                            }}
                            styles={{
                                width: '90%',
                            }}
                        />
                    ) : (
                        <InputForm
                            type="number"
                            name="numberDocument"
                            label="Número de documento"
                            required
                            specialConf={{
                                valueState: inputValues,
                                setValueState: setInputValues,
                            }}
                            styles={{
                                width: '90%',
                                marginBottom: '1rem',
                            }}
                        />
                    )}
                </MainForm>

                <div className={stylesPage.containerButton}>
                    <button
                        className={stylesPage.buttonSubmit}
                        onClick={recuperarDatos}
                        type="submit"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RecuperarContrasena
