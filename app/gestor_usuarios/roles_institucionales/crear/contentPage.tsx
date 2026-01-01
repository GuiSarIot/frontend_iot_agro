'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import InputForm from '@/components/shared/inputForm/inputForm'
import MainForm from '@/components/shared/mainForm/mainForm'
import stylesMainForm from '@/components/shared/mainForm/mainform.module.css'
import { useAppContext } from '@/context/appContext'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
}

interface Rol {
    code: string
    name: string
}

interface InputValues {
    nameRol?: string
    rolState?: string
    rolDescription?: string
    rolesAccess?: string[]
    rolLevelAccess?: string
    [key: string]: unknown
}

interface ContentPageProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ContentPage: React.FC<ContentPageProps> = ({
    infoPage = {
        title: 'Roles institucionales - crear',
        route: '/gestor_usuarios/roles_institucionales/crear'
    }
}) => {
    // * context
    const { changeTitle, showNavbar, showLoader } = useAppContext()

    // * hooks
    const router = useRouter()

    // * states
    const [rolsList, setRolsList] = useState<Rol[]>([])
    const [inputValues, setInputValues] = useState<InputValues>({})

    // * effects
    useEffect(() => {
        showLoader(true)
        if (window.innerWidth <= 1380) {
            showNavbar(false)
        } else {
            showNavbar(true)
        }
        changeTitle(infoPage.title)
        SaveRoute({
            title: infoPage.title,
            routeInfo: infoPage.route
        })
        loadRols()
        // eslint-disable-next-line
    }, [])

    // * methods
    const loadRols = async () => {
        const { data, status, message } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/roles_usuario`
        })
        if (status === 'error') {
            console.log(message)
            showLoader(false)
            return false
        }
        setRolsList(data as Rol[])
        showLoader(false)
    }

    const onSuccesResponse = () => {
        Swal.fire({
            icon: 'success',
            title: 'Proceso exitoso',
            text: 'Se ha creado el rol institucional',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
        }).then(() => {
            router.push('/gestor_usuarios/roles_institucionales')
        })
    }

    const onErrorResponse = () => {
        Swal.fire({
            icon: 'error',
            title: 'Opps...',
            text: 'Ha ocurrido un error, intenta nuevamente',
            timer: 1500
        })
    }

    const validateForm = () => {
        if (!inputValues.nameRol || inputValues.nameRol.trim() === '') {
            Swal.fire({
                icon: 'info',
                title: 'Opps...',
                text: 'El campo nombre rol institucional es obligatorio',
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 2500
            })
            return false
        }

        if (!inputValues.rolesAccess || inputValues.rolesAccess.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Opps...',
                text: 'El campo roles asignados es obligatorio',
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 2500
            })
            return false
        }

        if (!inputValues.rolState) {
            Swal.fire({
                icon: 'info',
                title: 'Opps...',
                text: 'El campo estado es obligatorio',
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 2500
            })
            return false
        }

        if (!inputValues.rolDescription || inputValues.rolDescription.trim() === '') {
            Swal.fire({
                icon: 'info',
                title: 'Opps...',
                text: 'El campo descripción es obligatorio',
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 2500
            })
            return false
        }

        if (inputValues.rolDescription.length < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Opps...',
                text: 'La descripción debe ser mayor a 10 caracteres',
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 2500
            })
            return false
        }

        if (!inputValues.rolLevelAccess) {
            Swal.fire({
                icon: 'info',
                title: 'Opps...',
                text: 'El campo nivel de acceso es obligatorio',
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 2500
            })
            return false
        }
        return true
    }

    // * renders
    return (
        <div>
            <MainForm
                submitText="Guardar"
                url={`${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/crear_rol_institucional`}
                method="POST"
                onSuccesResponse={onSuccesResponse}
                onErrorResponse={onErrorResponse}
                inputsValues={inputValues}
                onValidate={validateForm}
                loader={true}
            >
                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2>Roles institucionales</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm
                            label="Nombre rol institucional*"
                            name="nameRol"
                            type="text"
                            specialConf={{
                                setValueState: setInputValues,
                                valueState: inputValues
                            }}
                        />
                        <InputForm
                            label="Roles asignados*"
                            name="rolesAccess"
                            type="multiselect"
                            specialConf={{
                                options: rolsList.map(({ code, name }) => ({ code, name })),
                                setValueState: setInputValues,
                                valueState: inputValues
                            }}
                        />
                        <InputForm
                            label="Estado*"
                            name="rolState"
                            type="select"
                            specialConf={{
                                options: [
                                    { code: 'Activo', name: 'Activo' },
                                    { code: 'Inactivo', name: 'Inactivo' }
                                ],
                                setValueState: setInputValues,
                                valueState: inputValues
                            }}
                        />
                        <InputForm
                            label="Descripción*"
                            name="rolDescription"
                            type="textarea"
                            specialConf={{
                                setValueState: setInputValues,
                                valueState: inputValues
                            }}
                        />
                        <InputForm
                            label="Nivel de acceso*"
                            name="rolLevelAccess"
                            type="select"
                            specialConf={{
                                options: [
                                    { code: 'CENTRO', name: 'CENTRO' },
                                    { code: 'REGIONAL', name: 'REGIONAL' },
                                    { code: 'NACIONAL', name: 'NACIONAL' },
                                    { code: 'ROOT', name: 'ROOT' }
                                ],
                                setValueState: setInputValues,
                                valueState: inputValues
                            }}
                        />
                    </div>
                </section>
            </MainForm>
        </div>
    )
}

export default ContentPage