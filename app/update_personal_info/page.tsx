'use client'

import { useState, useEffect, useContext, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Swal from 'sweetalert2'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import InputForm from '@/components/shared/inputForm/inputForm'
import MainForm from '@/components/shared/mainForm/mainForm'
import stylesMainForm from '@/components/shared/mainForm/mainform.module.css'
import AppContext from '@/context/appContext'

import ManageImage from '../gestor_usuarios/manageImage'

// Tipos para props
interface InfoPage {
    title: string
    route: string
}

interface ContentPageUpdateProps {
    infoPage?: InfoPage
}

// Tipos para los formularios
interface InputsValues {
    [key: string]: unknown
    tipoDocumento: string
    numeroDocumento: number
    nombres: string
    apellidos: string
    numeroTelefono: string
    correoElectronico: string
    correoElectronicoCorporativo: string
    skype: string
    tipoVinculacion: string
    profesion: string
    nombreUsuario: string
    password: string
    passwordConfirm: string
    profilePicture: Record<string, string>
}

interface UserInfoForm {
    userTypeDocument?: string
    userNumDoc?: number
    name?: string
    lastname?: string
    userPhone?: string
    userEmailA?: string
    emailI?: string
    userSkype?: string
    userTypeLink?: string
    userProfession?: string
    userName?: string
    userPassword?: string
    userImage?: string
}

const ContentPageUpdate: React.FC<ContentPageUpdateProps> = ({
    infoPage = { title: 'Listado de usuarios', route: '/gestor_usuarios' }
}) => {
    //* context
    const { changeTitle, appState, showLoader, changeUserInfo } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* hooks
    const router = useRouter()

    //* states
    const [listTypeDocuments, setListTypeDocuments] = useState<{ code: string; name: string }[]>([])
    const [userInfoForm, setUserInfoForm] = useState<UserInfoForm>({})
    const [inputsValues, setInputsValues] = useState<InputsValues>({
        tipoDocumento: '',
        numeroDocumento: 0,
        nombres: '',
        apellidos: '',
        numeroTelefono: '',
        correoElectronico: '',
        correoElectronicoCorporativo: '',
        skype: '',
        tipoVinculacion: '',
        profesion: '',
        nombreUsuario: '',
        password: '',
        passwordConfirm: '',
        profilePicture: {}
    })

    //* methods
    const loadTypeDocuments = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/tipos_documentos` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListTypeDocuments(data as { code: string; name: string }[])
    }


    const loadInfoUser = useCallback(async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/update_personal_info/user_personal_info/${userInfo.id}` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        if (data && typeof data === 'object' && 'infoUser' in data) {
            setUserInfoForm((data as { infoUser: UserInfoForm }).infoUser)
            setInputsValues({
                tipoDocumento: (data as { infoUser: UserInfoForm }).infoUser.userTypeDocument ?? '',
                numeroDocumento: (data as { infoUser: UserInfoForm }).infoUser.userNumDoc ?? 0,
                nombres: (data as { infoUser: UserInfoForm }).infoUser.name ?? '',
                apellidos: (data as { infoUser: UserInfoForm }).infoUser.lastname ?? '',
                numeroTelefono: (data as { infoUser: UserInfoForm }).infoUser.userPhone ?? '',
                correoElectronico: (data as { infoUser: UserInfoForm }).infoUser.userEmailA ?? '',
                correoElectronicoCorporativo: (data as { infoUser: UserInfoForm }).infoUser.emailI ?? '',
                skype: (data as { infoUser: UserInfoForm }).infoUser.userSkype ?? '',
                tipoVinculacion: (data as { infoUser: UserInfoForm }).infoUser.userTypeLink ?? '',
                profesion: (data as { infoUser: UserInfoForm }).infoUser.userProfession ?? '',
                nombreUsuario: (data as { infoUser: UserInfoForm }).infoUser.userName ?? '',
                password: (data as { infoUser: UserInfoForm }).infoUser.userPassword ?? '',
                passwordConfirm: (data as { infoUser: UserInfoForm }).infoUser.userPassword ?? '',
                profilePicture: {
                    type: (data as { infoUser: UserInfoForm }).infoUser.userImage?.split('.').pop()
                }
            })
        }
        showLoader(false)
    }, [userInfo.id, showLoader])

    //* effects
    useEffect(() => {
        showLoader(true)
        loadTypeDocuments()
        loadInfoUser()
    }, [loadInfoUser, showLoader])

    const validateForm = (): boolean => {
        const { profilePicture } = inputsValues

        if (Object.keys(profilePicture).length > 1) {
            const estadoImg = ManageImage(inputsValues)
            if (!estadoImg) {
                return false
            }
        }

        return true
    }

    const userUpdate = <T = unknown>(message: string, data?: T) => {
        Swal.fire({
            title: 'Proceso exitoso',
            text: 'El usuario se ha actualizado correctamente',
            icon: 'success'
        }).then(() => {
            changeTitle(infoPage.title)
            SaveRoute({
                routeInfo: infoPage.route,
                title: infoPage.title
            })

            // Only update if data and us_image exist
            const us_image = (data && typeof data === 'object' && 'us_image' in data)
                ? (data as { us_image: string }).us_image
                : undefined

            if (us_image) {
                changeUserInfo({
                    ...userInfo,
                    nameImage: us_image
                })
            }

            router.push(infoPage.route)
        })
    }

    const userNotUpdate = (message: string) => {
        Swal.fire({
            title: 'Upss...',
            text: 'Ocurrio un error al actualizar la información personal',
            icon: 'error'
        }).then(() => console.log(message))
    }

    //* renders
    return (
        <MainForm
            submitText="Actualizar"
            inputsValues={inputsValues}
            url={`${process.env.NEXT_PUBLIC_API_URL}/update_personal_info/actualizar_personal_info/${userInfo.id}`}
            method="PUT"
            onSuccesResponse={userUpdate}
            onErrorResponse={userNotUpdate}
            onValidate={validateForm}
        >
            <section>
                <div className={stylesMainForm.sectionTitle}>
                    <h2>Información personal</h2>
                </div>
                <div className={stylesMainForm.sectionInputs}>
                    <InputForm
                        label="Tipo de documento*"
                        required
                        disabled
                        type="select"
                        name="tipoDocumento"
                        valueProp={userInfoForm.userTypeDocument}
                        specialConf={{
                            options: listTypeDocuments.map(({ code, name }) => ({ name, code })),
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Número de documento*"
                        required
                        type="number"
                        disabled
                        name="numeroDocumento"
                        valueProp={userInfoForm.userNumDoc}
                        specialConf={{
                            min: 0,
                            max: 9999999999,
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Nombres*"
                        required
                        type="text"
                        name="nombres"
                        valueProp={userInfoForm.name}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Apellidos*"
                        required
                        type="text"
                        name="apellidos"
                        valueProp={userInfoForm.lastname}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Número de teléfono"
                        type="text"
                        name="numeroTelefono"
                        valueProp={userInfoForm.userPhone}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Correo electrónico personal"
                        type="email"
                        name="correoElectronico"
                        valueProp={userInfoForm.userEmailA}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                </div>
            </section>

            <section>
                <div className={stylesMainForm.sectionTitle}>
                    <h2>Información corporativa</h2>
                </div>
                <div className={stylesMainForm.sectionInputs}>
                    <InputForm
                        label="Correo electrónico corporativo*"
                        required
                        disabled
                        type="email"
                        name="correoElectronicoCorporativo"
                        valueProp={userInfoForm.emailI}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Skype"
                        type="text"
                        name="skype"
                        valueProp={userInfoForm.userSkype}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Tipo vinculación*"
                        required
                        disabled
                        type="select"
                        name="tipoVinculacion"
                        valueProp={userInfoForm.userTypeLink}
                        specialConf={{
                            options: [
                                { name: 'Contratista', code: 'CONTRATISTA' },
                                { name: 'De planta', code: 'DE_PLANTA' },
                            ],
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Profesión"
                        type="text"
                        name="profesion"
                        valueProp={userInfoForm.userProfession}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Foto de perfil"
                        type="file"
                        name="profilePicture"
                        specialConf={{
                            nameLabel: 'Seleccionar archivo',
                            accept: 'image/*',
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                </div>
            </section>

            <section>
                <div className={stylesMainForm.sectionTitle}>
                    <h2>Información de acceso</h2>
                </div>
                <div className={stylesMainForm.sectionInputs}>
                    <InputForm
                        label="Nombre de usuario*"
                        required
                        type="text"
                        name="nombreUsuario"
                        valueProp={userInfoForm.userName}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Contraseña*"
                        required
                        type="password"
                        name="password"
                        valueProp={userInfoForm.userPassword}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                    <InputForm
                        label="Confirmar contraseña*"
                        required
                        type="password"
                        name="passwordConfirm"
                        valueProp={userInfoForm.userPassword}
                        specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }}
                    />
                </div>
            </section>
        </MainForm>
    )
}

export default ContentPageUpdate
