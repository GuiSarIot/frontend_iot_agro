'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import BadgeIcon from '@mui/icons-material/Badge'
import FolderSharedIcon from '@mui/icons-material/FolderShared'
import KeyIcon from '@mui/icons-material/Key'
import Swal from 'sweetalert2'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import ConsumerAPI from '@/components/shared/consumerAPI/consumerAPI'
import InputForm from '@/components/shared/inputForm/inputForm'
import MainForm from '@/components/shared/mainForm/mainForm'
import stylesMainForm from '@/components/shared/mainForm/mainform.module.css'
import { useAppContext } from '@/context/appContext'

import stylesPage from './crearPage.module.css'
import ManageImage from '../manageImage'

// ---- Interfaces ----
interface InfoPage {
    title: string
    route: string
}

interface TypeDocument {
    code: string
    name: string
}

interface Region {
    code: string
    name: string
}

interface Center {
    code: string
    name: string
}

interface Rol {
    code: string
    name: string
}

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
    estado: string
    origen: string
    ultimaIntegracion: string
    tipoVinculacion: string
    profesion: string
    fechaInicioContrato: string
    fechaFinContrato: string
    regional: string
    centro: string
    rolesUsuario: string[]
    nombreUsuario: string
    password: string
    passwordConfirm: string
    profilePicture: Record<string, unknown>
    rolInstitucional: string | null
}

interface ContentPageCreateProps {
    infoPage?: InfoPage
}

// ---- Componente principal ----
const ContentPageCreate: React.FC<ContentPageCreateProps> = ({
    infoPage = {
        title: 'Crear Usuario',
        route: 'gestor_usuarios/crear'
    }
}) => {
    // * context
    const { changeTitle, showNavbar, showLoader } = useAppContext()

    // * hooks
    const router = useRouter()

    // * states
    const [listTypeDocuments, setListTypeDocuments] = useState<TypeDocument[]>([])
    const [listRegions, setListRegions] = useState<Region[]>([])
    const [listCenters, setListCenters] = useState<Center[]>([])
    const [listRols, setListRols] = useState<Rol[]>([])
    const [listRolsInst, setListRolsInst] = useState<Rol[]>([])
    const [inputsValues, setInputsValues] = useState<InputsValues>({
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
        rolesUsuario: [],
        nombreUsuario: '',
        password: '',
        passwordConfirm: '',
        profilePicture: {},
        rolInstitucional: null
    })

    // * effects
    useEffect(() => {
        showLoader(true)
        showNavbar(window.innerWidth > 1380)
        changeTitle(infoPage.title)
        SaveRoute({
            routeInfo: infoPage.route,
            title: infoPage.title
        })
        loadRegions()
        loadTypeDocuments()
        loadRols()
        loadRolInstitutional()
        // eslint-disable-next-line
    }, [])

    // * methods
    const loadTypeDocuments = async () => {
        const { status, message, data } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/tipos_documentos`
        })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListTypeDocuments(data as TypeDocument[])
    }

    const loadRegions = async () => {
        const { status, message, data } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/regionales`
        })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListRegions(data as Region[])
    }

    const loadCenters = async (region: string) => {
        const { status, message, data } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/regional_centros/${region}`
        })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListCenters(data as Center[])
    }

    const loadRols = async () => {
        const { status, message, data } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/roles_usuario`
        })

        if (status === 'error') {
            console.error(message)
            return false
        }

        setListRols(data as Rol[])
    }

    const loadRolInstitutional = async () => {
        const { status, message, data } = await ConsumerAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/get_roles_institucionales`
        })

        if (status === 'error') {
            console.error(message)
            showLoader(false)
            return false
        }

        setListRolsInst(data as Rol[])
        showLoader(false)
    }

    const userCreated = () => {
        Swal.fire({
            title: 'Proceso exitoso',
            text: 'El usuario se ha creado correctamente',
            icon: 'success'
        }).then(() => {
            router.push('/gestor_usuarios')
        })
    }

    const userNotCreated = (message: string) => {
        Swal.fire({
            title: 'Upss...',
            text: message,
            icon: 'error'
        })
    }

    const validateForm = () => {
        const { tipoDocumento, numeroDocumento, rolInstitucional, rolesUsuario, profilePicture, password, passwordConfirm } = inputsValues

        if (tipoDocumento === '') {
            Swal.fire({
                text: 'Debe seleccionar un tipo de documento',
                title: 'Error en la validaciones',
                icon: 'warning'
            })
            return false
        }
        if (!(numeroDocumento > 0)) {
            Swal.fire({
                text: 'El número de documento debe ser mayor a 0',
                title: 'Error en la validaciones',
                icon: 'warning'
            })
            return false
        }
        if ((rolesUsuario === null || rolesUsuario.length === 0) && (rolInstitucional == null || rolInstitucional === '')) {
            Swal.fire({
                text: 'Debe asignar al menos un rol de usuario o institucional al ususario',
                title: 'Error en la validaciones',
                icon: 'warning'
            })
            return false
        }
        if (Object.keys(profilePicture).length > 0) {
            const estadoImg = ManageImage(inputsValues)
            if (!estadoImg) {
                return false
            }
        }
        if (password !== passwordConfirm) {
            Swal.fire({
                text: 'Las contraseñas deben ser iguales',
                title: 'Error en la validación',
                icon: 'warning'
            })
            return false
        }
        return true
    }

    // * renders
    return (
        <>
            <MainForm
                submitText="Guardar"
                inputsValues={inputsValues}
                url={`${process.env.NEXT_PUBLIC_API_URL}/gestion_usuarios/crear`}
                method="POST"
                onSuccesResponse={userCreated}
                onErrorResponse={userNotCreated}
                onValidate={validateForm}
            >
                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2><AccountCircleIcon /> Información personal</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm
                            label="Tipo de documento*"
                            type="select"
                            name="tipoDocumento"
                            specialConf={{
                                options: listTypeDocuments.map(({ code, name }) => ({ name, code })),
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Número de documento*"
                            required={true}
                            type="number"
                            name="numeroDocumento"
                            specialConf={{
                                min: 0,
                                max: 9999999999,
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Nombres*"
                            required={true}
                            type="text"
                            name="nombres"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Apellidos*"
                            required={true}
                            type="text"
                            name="apellidos"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Número de teléfono"
                            type="text"
                            name="numeroTelefono"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Correo electrónico personal"
                            type="email"
                            name="correoElectronico"
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
                        <h2><FolderSharedIcon /> Información corporativa</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm
                            label="Correo electrónico corporativo*"
                            required={true}
                            type="email"
                            name="correoElectronicoCorporativo"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Skype"
                            type="text"
                            name="skype"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Estado*"
                            required={true}
                            type="select"
                            name="estado"
                            specialConf={{
                                options: [
                                    { name: 'Activo', code: 'activo' },
                                    { name: 'Inactivo', code: 'inactivo' }
                                ],
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Origen"
                            type="text"
                            name="origen"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Última integración"
                            type="date"
                            name="ultimaIntegracion"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Tipo vinculación*"
                            required={true}
                            type="select"
                            name="tipoVinculacion"
                            specialConf={{
                                options: [
                                    { name: 'Contratista', code: 'CONTRATISTA' },
                                    { name: 'De planta', code: 'DE_PLANTA' }
                                ],
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Profesión"
                            type="text"
                            name="profesion"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Fecha inicio contrato"
                            type="date"
                            name="fechaInicioContrato"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Fecha fin contrato"
                            type="date"
                            name="fechaFinContrato"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Regional*"
                            required={true}
                            type="select"
                            name="regional"
                            specialConf={{
                                options: listRegions.map(({ code, name }) => ({ code, name })),
                                valueState: inputsValues,
                                setValueState: setInputsValues,
                                onChange: loadCenters
                            }}
                        />
                        <InputForm
                            label="Centro*"
                            required={true}
                            type="select"
                            name="centro"
                            specialConf={{
                                options: listCenters.map(({ code, name }) => ({
                                    name: `${code} - ${name}`,
                                    code
                                })),
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                    </div>
                </section>
                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2><BadgeIcon /> Rol de usuario</h2>
                        <p className={stylesPage.sectionTitleP}>
                            Se debe asignar un rol de usuario o un rol institucional al usuario
                        </p>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm
                            label="Roles del usuario"
                            type="multiselect"
                            name="rolesUsuario"
                            specialConf={{
                                options: listRols.map(({ code, name }) => ({ name, code })),
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Rol institucional"
                            type="select"
                            name="rolInstitucional"
                            specialConf={{
                                options: listRolsInst.map(({ code, name }) => ({ code, name })),
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                    </div>
                </section>
                <section>
                    <div className={stylesMainForm.sectionTitle}>
                        <h2><KeyIcon /> Información de acceso</h2>
                    </div>
                    <div className={stylesMainForm.sectionInputs}>
                        <InputForm
                            label="Nombre de usuario*"
                            required={true}
                            type="text"
                            name="nombreUsuario"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Contraseña*"
                            required={true}
                            type="password"
                            name="password"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                        <InputForm
                            label="Confirmar contraseña*"
                            required={true}
                            type="password"
                            name="passwordConfirm"
                            specialConf={{
                                valueState: inputsValues,
                                setValueState: setInputsValues
                            }}
                        />
                    </div>
                </section>
            </MainForm>
        </>
    )
}

export default ContentPageCreate