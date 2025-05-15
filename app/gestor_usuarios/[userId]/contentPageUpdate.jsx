'use client'

import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import AppContext from '@/context/appContext'
import MainForm from '@/components/shared/mainForm/mainForm'
import stylesMainForm from '@/components/shared/mainForm/mainform.module.css'
import InputForm from '@/components/shared/inputForm/inputForm'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import ManageImage from '../manageImage'


const ContentPageUpdate = ({ userUrl }, {
    infoPage = {
        title: 'Actualización de usuario',
        route: '/gestor_usuarios/'
    }
}) => {

    //* context
    const { changeTitle, showNavbar, showLoader } = useContext(AppContext.Context)

    //* hooks
    const router = useRouter()

    //* states
    const [listTypeDocuments, setListTypeDocuments] = useState([])
    const [listRegions, setListRegions] = useState([])
    const [listCenters, setListCenters] = useState([])
    const [listRols, setListRols] = useState([])
    const [userInfoForm, setUserInfoForm] = useState({})
    const [listRolsInst, setListRolsInst] = useState([])
    const [inputsValues, setInputsValues] = useState({
        tipoDocumento: '',
        numeroDocumento: 0,
        nombres: '',
        apellidos: '',
        numeroTelefono: '',
        correoElectronico: '',
        correoElectronicoCorporativo: '',
        skype: '',
        estado: '',
        origen: '',
        ultimaIntegracion: '',
        tipoVinculacion: '',
        profesion: '',
        fechaInicioContrato: '',
        fechaFinContrato: '',
        regional: '',
        centro: '',
        rolesUsuario: '',
        nombreUsuario: '',
        password: '',
        passwordConfirm: '',
        profilePicture: {},
        rolInstitucional: ''
    })
    const [centerCode, setCenterCode] = useState('')

    //* effects
    useEffect(() => {
        showLoader(true)
        window.innerWidth <= 1380 ? showNavbar(false) : showNavbar(true)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: `${infoPage.route}${userUrl.userId}`,
            title: `${infoPage.title}${userUrl.userId}`
        })
        loadRegions()
        loadTypeDocuments()
        loadRols()
        loadRolInstitutional()
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

    const loadRegions = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/regionales` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListRegions(data)
    }

    const loadCenters = async (region, idCenter) => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/regional_centros/${region}` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListCenters(data)
        setCenterCode(idCenter)
        showLoader(false)
    }

    const loadRols = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/roles_usuario` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListRols(data)
    }

    const loadRolInstitutional = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/get_roles_institucionales` })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListRolsInst(data)
    }

    const loadInfoUser = async () => {
        const { status, message, data } = await ConsumerAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/userInfo/${userUrl.userId}` })
        if (status === 'error') {
            console.error(message)
            return false
        }

        setUserInfoForm(data.infoUser)
        loadCenters(data.infoUser.regionalCode, data.infoUser.centerCode)
        setInputsValues({
            ...inputsValues,
            tipoDocumento: data.infoUser.userTypeDocument,
            numeroDocumento: data.infoUser.userNumDoc,
            nombres: data.infoUser.name,
            apellidos: data.infoUser.lastname,
            numeroTelefono: data.infoUser.userPhone,
            correoElectronico: data.infoUser.userEmailA,
            correoElectronicoCorporativo: data.infoUser.emailI,
            skype: data.infoUser.userSkype,
            estado: data.infoUser.userState,
            origen: data.infoUser.userOrigin,
            ultimaIntegracion: data.infoUser.userLastIntegration,
            tipoVinculacion: data.infoUser.userTypeLink,
            profesion: data.infoUser.userProfession,
            fechaInicioContrato: data.infoUser.userContractStart,
            fechaFinContrato: data.infoUser.userContractEnd,
            regional: data.infoUser.regionalCode,
            centro: data.infoUser.centerCode,
            rolesUsuario: data.infoUser.roles,
            nombreUsuario: data.infoUser.userName,
            password: data.infoUser.userPassword,
            passwordConfirm: data.infoUser.userPassword,
            rolInstitucional: data.infoUser.rolIntitutional,
            profilePicture: {
                type: data.infoUser.userImage.split('.').pop()
            }
        })
        changeTitle('Actualización de usuario: ' + data.infoUser.name + ' ' + data.infoUser.lastname)
    }

    const userUpdate = () => {
        Swal.fire({
            title: 'Proceso exitoso',
            text: 'El usuario se ha actualizado correctamente',
            icon: 'success'
        }).then(() => {
            router.push('/gestor_usuarios')
        })
    }

    const userNotUpdate = (message) => {
        Swal.fire({
            title: 'Upss...',
            text: message,
            icon: 'error'
        }).then(
            () => console.log(message)
        )
    }

    const validateForm = () => {
        const { numeroDocumento, rolInstitucional, rolesUsuario, profilePicture } = inputsValues

        if (!(numeroDocumento > 0)) {
            Swal.fire({
                text: 'El número de documento debe ser mayor a 0',
                title: 'Error en la validaciones',
                icon: 'error'
            })

            return false
        }

        if (rolInstitucional == null && rolesUsuario.length == 0) {
            Swal.fire({
                text: 'Debe asignar un rol al usuario o asignarle un rol institucional',
                title: 'Error en la validaciones',
                icon: 'error'
            })

            return false
        }

        if (Object.keys(profilePicture).length > 1) {
            const estadoImg = ManageImage(inputsValues)
            if (!estadoImg) {
                return false
            }
        }

        return true
    }


    //* renders
    return (
        <>
            <MainForm submitText="Actualizar" inputsValues={inputsValues} url={`${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/actualizar/${userUrl.userId}`} method="PUT" onSuccesResponse={userUpdate} onErrorResponse={userNotUpdate} onValidate={validateForm}>
                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2>Información personal</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm label="Tipo de documento*" required={true} type="select" name="tipoDocumento" valueProp={userInfoForm.userTypeDocument} specialConf={{
                            options: listTypeDocuments.map(({ code, name }) => ({ name, code })),
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Número de documento*" required={true} type="number" name="numeroDocumento" valueProp={userInfoForm.userNumDoc} specialConf={{
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
                        <InputForm label="Correo electrónico corporativo*" required={true} type="email" name="correoElectronicoCorporativo" valueProp={userInfoForm.emailI} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Skype" type="text" name="skype" valueProp={userInfoForm.userSkype} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Estado*" required={true} type="select" name="estado" valueProp={userInfoForm.userState} specialConf={{
                            options: [
                                { name: 'Activo', code: 'ACTIVO' },
                                { name: 'Inactivo', code: 'INACTIVO' }
                            ],
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Origen" type="text" name="origen" valueProp={userInfoForm.userOrigin} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Última integración" type="date" name="ultimaIntegracion" valueProp={userInfoForm.userContractEnd} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Tipo vinculación*" required={true} type="select" name="tipoVinculacion" valueProp={userInfoForm.userTypeLink} specialConf={{
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
                        <InputForm label="Fecha inicio contrato" type="date" name="fechaInicioContrato" valueProp={userInfoForm.userContractStart} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Fecha fin contrato" type="date" name="fechaFinContrato" valueProp={userInfoForm.userContractEnd} specialConf={{
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Regional*" required={true} type="select" name="regional" valueProp={userInfoForm.regionalCode} specialConf={{
                            options: listRegions.map(({ code, name }) => ({ code, name })),
                            valueState: inputsValues,
                            setValueState: setInputsValues,
                            onChange: loadCenters
                        }} />
                        <InputForm label="Centro*" required={true} type="select" name="centro" valueProp={centerCode} specialConf={{
                            options: listCenters.map(({ code, name }) => ({
                                name: `${code} - ${name}`,
                                code
                            })),
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Roles del usuario" type="multiselect" name="rolesUsuario" valueProp={userInfoForm.roles} specialConf={{
                            options: listRols.map(({ code, name }) => ({ name, code })),
                            valueState: inputsValues,
                            setValueState: setInputsValues
                        }} />
                        <InputForm label="Rol institucional" type="select" name="rolInstitucional" valueProp={userInfoForm.rolIntitutional} specialConf={{
                            options: listRolsInst.map(({ code, name }) => ({ code, name })),
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
    userUrl: PropTypes.object
}

export default ContentPageUpdate