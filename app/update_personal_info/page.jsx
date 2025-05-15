'use client'

import { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import AppContext from '@/context/appContext'
import MainForm from '@/components/shared/mainForm/mainForm'
import stylesMainForm from '@/components/shared/mainForm/mainform.module.css'
import InputForm from '@/components/shared/inputForm/inputForm'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ManageImage from '../gestor_usuarios/manageImage'


const ContentPageUpdate = ({
    infoPage = {
        title: 'Listado de usuarios',
        route: '/gestor_usuarios'
    }
}) => {

    //* context
    const { changeTitle, appState, showLoader, changeUserInfo } = useContext(AppContext.Context)
    const { userInfo } = appState

    //* hooks
    const router = useRouter()

    //* states
    const [listTypeDocuments, setListTypeDocuments] = useState([])
    const [userInfoForm, setUserInfoForm] = useState({})
    const [inputsValues, setInputsValues] = useState({
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

    //* effects
    useEffect(() => {
        showLoader(true)
        loadTypeDocuments()
        loadInfoUser()
    }, [])

    //* methods
    const loadTypeDocuments = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/tipos_documentos` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListTypeDocuments(data)
    }

    const loadInfoUser = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/update_personal_info/user_personal_info/${userInfo.id}` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setUserInfoForm(data.infoUser)
        setInputsValues({
            tipoDocumento: data.infoUser.userTypeDocument,
            numeroDocumento: data.infoUser.userNumDoc,
            nombres: data.infoUser.name,
            apellidos: data.infoUser.lastname,
            numeroTelefono: data.infoUser.userPhone,
            correoElectronico: data.infoUser.userEmailA,
            correoElectronicoCorporativo: data.infoUser.emailI,
            skype: data.infoUser.userSkype,
            tipoVinculacion: data.infoUser.userTypeLink,
            profesion: data.infoUser.userProfession,
            nombreUsuario: data.infoUser.userName,
            password: data.infoUser.userPassword,
            passwordConfirm: data.infoUser.userPassword,
            profilePicture: {
                type: data.infoUser.userImage.split('.').pop()
            }
        })
        showLoader(false)

    }

    const validateForm = () => {
        const { profilePicture } = inputsValues

        if (Object.keys(profilePicture).length > 1) {
            const estadoImg = ManageImage(inputsValues)
            if (!estadoImg) {
                return false
            }
        }

        return true
    }

    const userUpdate = (message, data) => {
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

            const {us_image} = data

            changeUserInfo({
                ...userInfo,
                nameImage: us_image
            })
            
            router.push(infoPage.route)
        })
    }

    const userNotUpdate = (message) => {
        Swal.fire({
            title: 'Upss...',
            text: 'Ocurrio un error al actualizar la información personal',
            icon: 'error'
        }).then(
            () => console.log(message)
        )
    }

    //* renders
    return (
        <>
            <MainForm submitText="Actualizar" inputsValues={inputsValues} url={`${process.env.NEXT_PUBLIC_API_URL}/update_personal_info/actualizar_personal_info/${userInfo.id}`} method="PUT" onSuccesResponse={userUpdate} onErrorResponse={userNotUpdate} onValidate={validateForm}>
                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2>Información personal</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm label="Tipo de documento*" required={true} disabled={true} type="select" name="tipoDocumento" valueProp={userInfoForm.userTypeDocument} specialConf={{
                            options: listTypeDocuments.map(({ code, name }) => ({ name, code })),
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Número de documento*" required={true} type="number" disabled name="numeroDocumento" valueProp={userInfoForm.userNumDoc} specialConf={{
                            min: 0,
                            max: 9999999999,
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Nombres*" required={true} type="text" name="nombres" valueProp={userInfoForm.name} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Apellidos*" required={true} type="text" name="apellidos" valueProp={userInfoForm.lastname} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />

                        <InputForm label="Número de teléfono" type="text" name="numeroTelefono" valueProp={userInfoForm.userPhone} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Correo electrónico personal" type="email" name="correoElectronico" valueProp={userInfoForm.userEmailA} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                    </div>
                </section>

                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2>Información corporativa</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm label="Correo electrónico corporativo*" required={true} disabled={true} type="email" name="correoElectronicoCorporativo" valueProp={userInfoForm.emailI} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        
                        <InputForm label="Skype" type="text" name="skype" valueProp={userInfoForm.userSkype} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />

                        <InputForm label="Tipo vinculación*" required={true} disabled={true} type="select" name="tipoVinculacion" valueProp={userInfoForm.userTypeLink} specialConf={{
                            options: [
                                { name: 'Contratista', code: 'CONTRATISTA' },
                                { name: 'De planta', code: 'DE_PLANTA' },
                            ],
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />

                        <InputForm label="Profesión" type="text" name="profesion" valueProp={userInfoForm.userProfession} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />

                        <InputForm label="Foto de perfil" type="file" name="profilePicture" specialConf={{
                            nameLabel: 'Seleccionar archivo',
                            accept: 'image/*',
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />

                    </div>
                </section>

                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2>Información de acceso</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm label="Nombre de usuario*" required={true} type="text" name="nombreUsuario" valueProp={userInfoForm.userName} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Contraseña*" required={true} type="password" name="password" valueProp={userInfoForm.userPassword} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Confirmar contraseña*" required={true} type="password" name="passwordConfirm" valueProp={userInfoForm.userPassword} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                    </div>
                </section>
            </MainForm>
        </>
    )
}

ContentPageUpdate.propTypes = {
    infoPage: PropTypes.object
}

export default ContentPageUpdate