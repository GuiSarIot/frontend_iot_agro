'use client'

import React from 'react'

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

    return (
        <div className={stylesLogin.container}>
            <main className={stylesLogin.loginContent}>
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
                        <InputLogin label="Número de documento" ref={usernameRef} name="username" />
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

                        <Button type="submit" variant="contained" color="primary" fullWidth className={stylesLogin.primaryButton}>
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
                    >
                        Continuar con Google
                    </Button>
                </div>
            </main>

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