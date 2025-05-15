'use client'
import { useRouter } from 'next/navigation'
import { useRef, useContext, useState, useEffect, forwardRef } from 'react'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import Image from 'next/image'
import Swal from 'sweetalert2'
import Link from 'next/link'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AppContext from '@/context/appContext'
import stylesLogin from './login.module.css'
import Logo from '@/images/logos/logo_sena.png'
import Logo_ejemplo from '@/images/logos/logo-ejemplo.png'
import Logo_gov_col from '@/images/logos/logo_gov_col.png'
import Logo_icontec from '@/images/logos/normas-iso-logos.svg'
import Logo_min_trabajo from '@/images/logos/1_Logo_min_trabajo.png'
import Logo_organizaciones_solidarias from '@/images/logos/2_Logo_organizaciones_solidarias.png'
import Logo_servicio_empleo from '@/images/logos/3_Logo_servicio_empleo.png'
import Logo_supersubsidio from '@/images/logos/4_Logo_supersubsidio.png'
import Logo_colpensiones from '@/images/logos/5_Logo_colpensiones.png'
import Imagen_instructor from '@/images/imagenes/imagen-prueba-core.png'
import Imagen_radio from '@/images/imagenes/imagen-prueba-core.png'
import Imagen_video from '@/images/imagenes/video-prueba-core.png'
import ConsumerPublicAPI from '@/components/shared/consumerAPI/consumerPublicAPI'
import SaveRoute from '@/components/protectedRoute/saveRoute'
import GetRoute from '@/components/protectedRoute/getRoute'
import 'primeflex/primeflex.scss'
import SliderSection from '@/components/shared/sliderSection/sliderSection'
import SocialLinks from '@/components/shared/socialLinks/socialLinks'

const InputLogin = forwardRef(({ type, name, label, onChange }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = (event) => {
        event.preventDefault()
        setShowPassword(!showPassword)
    }

    return (
        <div className={stylesLogin.loginInputContainer}>
            <label htmlFor={name}>{label}</label>
            <div className={stylesLogin.inputWrapper}>
                <input
                    required
                    ref={ref}
                    type={showPassword ? 'text' : type}
                    name={name}
                    onChange={onChange}
                    className={stylesLogin.inputField}
                />
                {type === 'password' && (
                    <button
                        onClick={togglePasswordVisibility}
                        className={stylesLogin.eyeButton}
                        aria-label="Mostrar/Ocultar contraseña"
                    >
                        {showPassword ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                    </button>
                )}
            </div>
        </div>
    )
})


InputLogin.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    refProp: PropTypes.object
}

// const handleClick = () => {
//     window.open('https://gestorvirtual.sena.edu.co/agenti_lite_senaliz/', '_blank')
// }

const Login = () => {
    const { appState, changeUserInfo, changeAuthContext, changeTitle, showLoader } = useContext(AppContext.Context)
    const router = useRouter()
    const username = useRef(null)
    const password = useRef(null)

    useEffect(() => {
        showLoader(true)
        validateSession()
        showLoader(false)
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        showLoader(true)
        const userName = DOMPurify.sanitize(username.current.value)
        const passwordL = DOMPurify.sanitize(password.current.value)
        const body = { userName, password: passwordL }
        const { status, data } = await ConsumerPublicAPI({
            url: `${process.env.NEXT_PUBLIC_API_URL}/login/autenticar`,
            method: 'POST',
            body,
        })

        if (status === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: data.message || 'Ocurrió un error al iniciar sesión, por favor intenta de nuevo',
            })
            showLoader(false)
            return false
        }


        const idEncrypted = await encrypt(data.id)

        changeAuthContext({
            ...appState.authContext,
            isLoggedIn: true,
        })

        changeUserInfo({
            name: data.name,
            email: data.email,
            role: data.role.role,
            module: data.module,
            id: data.id,
            roles: data.roles,
            hasRolIntitutional: data.has_rol_intitutional,
            nameRolIntitutional: data.rol_intitutional,
            levelAccessRolIntitutional: data.rol_intitutional_level_access
        })

        changeTitle(data.role.role)
        SaveRoute({
            routeInfo: data.module,
            title: data.role.role,
            isLogged: true,
            user: idEncrypted,
            token: data.token
        })
        router.push(data.module)
    }

    const validateSession = async () => {
        const { isLogged, title, route, user } = await GetRoute()
        if (user !== 'false' && user !== undefined && isLogged !== 'false' && isLogged !== undefined) {
            changeTitle(title)
            router.push(route)
        }
    }

    const encrypt = async (id) => {
        const { data } = await ConsumerPublicAPI({ url: `${process.env.NEXT_PUBLIC_API_URL}/login/cifrarID/${id}` })
        return data
    }

    return (
        <div className={stylesLogin.container}>
            <header className={stylesLogin.header}></header>

            <nav className={stylesLogin.nav}>
                <div className={stylesLogin.navLogoLeft}>
                    <Image src={Logo_ejemplo} alt="Logo" width={0} height={80} />
                </div>

                <div className={stylesLogin.navLogoRight}>
                    <Image src={Logo} alt="Logo SENA" width={130} height={60} />
                </div>
            </nav>

            <main className={stylesLogin.mainContent}>
                <div className={stylesLogin.leftColumn}>
                    <SliderSection />
                </div>
                <div className={stylesLogin.rightColumn}>
                    <h2 className={stylesLogin.loginTitle}>Inicio de sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={'pb-3'}>
                            <div className="p-inputgroup flex-1">
                                <InputLogin label="Número de documento" ref={username} />
                            </div>
                        </div>
                        <InputLogin className={'pb-2'} type="password" name="password" label="Contraseña" ref={password} />
                        <div className={stylesLogin.sectionForgotPassword}>
                            <a href="/recuperar_contrasena" className={stylesLogin.forgotPasswordLink}>¿Recordar usuario o cambiar contraseña?</a>
                        </div>
                        <button type="submit">Ingresar</button>
                        {/* <button onClick={handleClick}>Ir al agente virtual</button> */}
                    </form>
                </div>
            </main>
            <main className={stylesLogin.tituloContent}>
                <div className={stylesLogin.titulo}>
                    <h2>Información de interés</h2>
                </div>
            </main>
            <main className={stylesLogin.mainContent}>
                <div className={stylesLogin.centerColumn}>
                    <Image
                        src={Imagen_video}
                        alt="Imagen de SENAVANCE Nuevo Login"
                        width={800}
                        height={500}
                    />
                </div>
                <div className={stylesLogin.rightColumnNuevo}>
                    <Link href="#" target="_blank">
                        <Image src={Imagen_instructor} alt="Imagen Instructor" className={stylesLogin.sectorInfoInteres} />
                    </Link>
                    <Link href="#" target="_blank">
                        <Image src={Imagen_radio} alt="Imagen Radio Sena" className={stylesLogin.sectorInfoInteres} />
                    </Link>
                </div>
            </main>
            <main className={stylesLogin.tituloContent}>
                <div className={stylesLogin.titulo}>
                    <h2>Sector empleo</h2>
                </div>
            </main>
            <main>
                <div className={stylesLogin.sectorEmpleoContainer}>
                    <Link href="https://www.mintrabajo.gov.co" target="_blank">
                        <Image src={Logo_min_trabajo} alt="Logo Min Trabajo" width={100} height={80} className={stylesLogin.sectorEmpleoImg} />
                    </Link>
                    <Link href="https://www.organizacionessolidarias.gov.co" target="_blank">
                        <Image src={Logo_organizaciones_solidarias} alt="Logo Organizaciones Solidatias" width={200} height={80} className={stylesLogin.sectorEmpleoImg} />
                    </Link>
                    <Link href="https://www.serviciodeempleo.gov.co" target="_blank">
                        <Image src={Logo_servicio_empleo} alt="Logo Servicio de empleo" width={200} height={80} className={stylesLogin.sectorEmpleoImg} />
                    </Link>
                    <Link href="https://www.supersubsidio.gov.co" target="_blank">
                        <Image src={Logo_supersubsidio} alt="Logo Supersubsidio" width={200} height={80} className={stylesLogin.sectorEmpleoImg} />
                    </Link>
                    <Link href="https://www.colpensiones.gov.co" target="_blank">
                        <Image src={Logo_colpensiones} alt="Logo Colpensiones" width={200} height={80} className={stylesLogin.sectorEmpleoImg} />
                    </Link>
                </div>
            </main>

            <footer className={stylesLogin.gobiernoContainer}>
                <div className={stylesLogin.gobiernoMinisterioContainer}>
                    <Image src={Logo_gov_col} alt="Logo Gobierno de Colombia" width={200} height={150} className={stylesLogin.gobiernoImg} />
                </div>
                <div className={stylesLogin.gobiernoMinisterioContainer}>
                    <a href="https://petro.presidencia.gov.co" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#c61720' }}></span>
                        Presidencia
                    </a>
                    <a href="https://www.minjusticia.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#01630c' }}></span>
                        MinJusticia
                    </a>
                    <a href="https://www.mininterior.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#3e6300' }}></span>
                        MinInterior
                    </a>
                    <a href="https://www.mintic.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#990001' }}></span>
                        MinTic
                    </a>
                    <a href="https://www.minsalud.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#410e99' }}></span>
                        MinSalud
                    </a>
                </div>
                <div className={stylesLogin.gobiernoMinisterioContainer}>
                    <a href="https://www.mincultura.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#38170c' }}></span>
                        MinCultura
                    </a>
                    <a href="https://www.minminas.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#151f99' }}></span>
                        MinMinas
                    </a>
                    <a href="https://www.mindefensa.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#531400' }}></span>
                        MinDefensa
                    </a>
                    <a href="https://www.mineducacion.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#531400' }}></span>
                        MinEducación
                    </a>
                    <a href="https://www.mintrabajo.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#0e3e99' }}></span>
                        MinTrabajo
                    </a>
                </div>
                <div className={stylesLogin.gobiernoMinisterioContainer}>
                    <a href="https://www.mintrabajo.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#0e3e99' }}></span>
                        MinTrabajo
                    </a>
                    <a href="https://www.mintransporte.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#5c8301' }}></span>
                        MinTransporte
                    </a>
                    <a href="https://www.urnadecristal.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#2b1399' }}></span>
                        Urna de Cristal
                    </a>
                    <a href="https://www.minhacienda.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#996201' }}></span>
                        MinHacienda
                    </a>
                    <a href="https://www.mincit.gov.co/inicio" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#1e7373' }}></span>
                        MinComercio
                    </a>
                </div>
                <div className={stylesLogin.gobiernoMinisterioContainer}>
                    <a href="https://www.minvivienda.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#992900' }}></span>
                        MinVivienda
                    </a>
                    <a href="https://www.minagricultura.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#3b9901' }}></span>
                        MinAgricultura
                    </a>
                    <a href="https://www.vicepresidencia.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#919191' }}></span>
                        Vicepresidencia
                    </a>
                    <a href="https://www.minambiente.gov.co/" target="_blank" rel="noreferrer" className={stylesLogin.gobiernoLink}>
                        <span className={stylesLogin.gobiernoMinisteriosSquare} style={{ backgroundColor: '#990001' }}></span>
                        MinAmbiente
                    </a>
                </div>
            </footer>
            <div className={stylesLogin.additionalContainer}>
                <div className={stylesLogin.leftColumnFooter}>
                    <h2>Servicio Nacional de Aprendizaje SENA</h2>
                    <p>Calle 57 No. 8 - 69 Bogotá D.C. (Cundinamarca), Colombia
                        <br />
                        El SENA brinda a la ciudadanía, atención presencial en las 33 Regionales y 117 Centros de Formación
                        <br />
                        Conozca aquí los puntos de atención
                        <br />
                        Líneas de atención al ciudadanos, empresarios y línea PQRS:
                        <br />
                        Bogotá +(57) 601 736 60 60 - Línea gratuita y resto del país 018000 910270</p>
                    <SocialLinks />
                </div>
                <div className={stylesLogin.centerColumnFooter}>
                    <h2>Enlaces rápidos</h2>
                    <p>
                        <a href="https://www.sena.edu.co/es-co/sena/Paginas/directorio.aspx" target="_blank" rel="noreferrer">
                            - Directorio SENA
                        </a>
                        <br />
                        <a href="https://sciudadanos.sena.edu.co/SolicitudIndex.aspx" target="_blank" rel="noreferrer">
                            - PQRS
                        </a>
                        <br />
                        <a href="https://www.sena.edu.co/es-co/ciudadano/Paginas/chat.aspx" target="_blank" rel="noreferrer">
                            - Chat en línea
                        </a>
                        <br />
                        <a href="https://www.sena.edu.co/es-co/ciudadano/Paginas/Denuncias_Corrupcion.aspx" target="_blank" rel="noreferrer">
                            - Denuncias por actos de corrupción
                        </a>
                        <br />
                        <a href="https://www.sena.edu.co/es-co/transparencia/Paginas/mecanismosContacto.aspx#notificacionesJudiciales" target="_blank" rel="noreferrer">
                            - Notificaciones judiciales
                        </a>
                        <br />
                        <a href="https://www.sena.edu.co/es-co/Paginas/politicasCondicionesUso.aspx" target="_blank" rel="noreferrer">
                            - Términos y condiciones del portal web
                        </a>
                        <br />
                        <a href="https://www.sena.edu.co/es-co/Paginas/politicasCondicionesUso.aspx#derechoAutor" target="_blank" rel="noreferrer">
                            - Derechos de autor y/o autorización de uso sobre contenidos
                        </a>
                        <br />
                        <a href="https://www.sena.edu.co/es-co/transparencia/Paginas/habeas_data.aspx" target="_blank" rel="noreferrer">
                            - Política de Tratamiento para Protección de Datos Personales
                        </a>
                        <br />
                        <a href="#" target="_blank" rel="noreferrer">
                            - Mapa del sitio
                        </a>
                        <br />
                        <a href="https://compromiso.sena.edu.co/index.php?text=inicio&id=27" target="_blank" rel="noreferrer">
                            - Política de seguridad y privacidad de la información
                        </a>
                    </p>
                </div>
                <div className={stylesLogin.rightColumnFooter}>
                    <Image src={Logo} alt="Logo" width={250} height={120} />
                    <Image src={Logo_icontec} alt="Logo Icontec" width={250} height={150} />
                </div>
            </div>
            <div style={{ backgroundColor: 'var(--header-color)', height: '40px', width: '100%' }}></div>
        </div>
    )
}
InputLogin.displayName = 'InputLogin'

export default Login
