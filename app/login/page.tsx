'use client'

import React, { useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import FacebookIcon from '@mui/icons-material/Facebook'
import GoogleIcon from '@mui/icons-material/Google'
import Button from '@mui/material/Button'

import InputLogin from './components/InputLogin'
import { useLogin } from './hooks/useLogin'
import stylesLogin from './styles/login.module.css'

import 'primeflex/primeflex.scss'

const Login: React.FC = () => {
    const router = useRouter()
    const { usernameRef, passwordRef, handleSubmit } = useLogin()

    // Forzar tema claro en la página de login
    useEffect(() => {
        document.title = 'Iniciar Sesión - IOTCorp'
        document.documentElement.setAttribute('data-theme', 'light')
        return () => {
            // Restaurar el tema guardado al salir
            const savedTheme = localStorage.getItem('theme') || 'light'
            document.documentElement.setAttribute('data-theme', savedTheme)
        }
    }, [])

    return (
        <div className={stylesLogin.container}>
            <div className={stylesLogin.loginContent}>
                <div className={stylesLogin.logoContainer}>
                    <Image
                        src="/logoH.png"
                        alt="Logo de IOTCorpSAS"
                        className={stylesLogin.logo}
                        width={200}  
                        height={60}  
                        priority
                        style={{ height: 'auto' }}
                    />
                </div>

                <div className={stylesLogin.loginFormPanel}>
                    <h2 className={stylesLogin.loginFormContent}>Inicio de sesión</h2>

                    <form onSubmit={handleSubmit}>
                        <InputLogin 
                            className={stylesLogin.InputLoginData}
                            label="Número de documento" 
                            ref={usernameRef} name="username" 
                        />
                        <InputLogin
                            className={stylesLogin.InputLoginData}
                            type="password"
                            name="password"
                            label="Contraseña"
                            ref={passwordRef}
                        />

                        <div className={stylesLogin.sectionForgotPassword}>
                            <a href="/recuperar_contrasena" className={stylesLogin.forgotPasswordLink}>
                                ¿Olvido su contraseña?
                            </a>
                        </div>

                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            fullWidth 
                            className={stylesLogin.primaryButton}                            
                        >
                            Ingresar
                        </Button>
                    </form>
                </div>

                <div className={stylesLogin.socialLogin}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={stylesLogin.socialButton}
                        onClick={() => router.push('/crear_cuenta')}
                        sx={{
                            '&:focus, &:focus-visible, &:hover, &:active': {
                                color: 'white !important',
                            }
                        }}
                    >
                        Crear cuenta
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FacebookIcon />}
                        fullWidth
                        className={stylesLogin.socialButton}
                        onClick={() => alert('Login con Facebook')}
                        sx={{
                            '&:focus, &:focus-visible, &:hover, &:active': {
                                color: 'white !important',
                            }
                        }}
                    >
                        Continuar con Facebook
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<GoogleIcon />}
                        fullWidth
                        className={stylesLogin.socialButton}
                        onClick={() => alert('Login con Google')}
                        sx={{
                            '&:focus, &:focus-visible, &:hover, &:active': {
                                color: 'white !important',
                            }
                        }}
                    >
                        Continuar con Google
                    </Button>
                </div>
            </div>

            <footer className={stylesLogin.footer}>
                <p>© 2025 IOTCorpSAS. Todos los derechos reservados. 1.0.0</p>
                <div className={stylesLogin.footerLinks}>
                    <a href="#">Términos y condiciones</a>
                    <a href="#">Política de privacidad</a>
                    <a href="#">Ayuda</a>
                </div>
            </footer>
        </div>
    )
}

export default Login