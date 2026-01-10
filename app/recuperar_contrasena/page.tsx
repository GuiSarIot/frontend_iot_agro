'use client'

import React, { useEffect } from 'react'

import Image from 'next/image'

import Button from '@mui/material/Button'

import RecuperarContrasenaLogin from './components/RecuperarContrasenaLogin'
import { useRecoveryPasswordLogin } from './hooks/useRecoveryPasswordLogin'
import stylesLogin from './styles/recuperar_contrasena.module.css'

import 'primeflex/primeflex.scss'

const RecuperarContrasena: React.FC = () => {
    const { userEmail, handleSubmit } = useRecoveryPasswordLogin()

    // Forzar tema claro en la página de recuperar contraseña
    useEffect(() => {
        document.title = 'Recuperar Contraseña - IOTCorp'
        document.documentElement.setAttribute('data-theme', 'light')
        return () => {
            // Restaurar el tema guardado al salir
            const savedTheme = localStorage.getItem('theme') || 'light'
            document.documentElement.setAttribute('data-theme', savedTheme)
        }
    }, [])

    return (
        <div className={stylesLogin.container}>
            <main className={stylesLogin.loginContent}>
                <div className={stylesLogin.logoContainer}>
                    <Image
                        src="/logoH.png"
                        alt="Logo de IOTCorpSAS"
                        className={stylesLogin.logo}
                        width={200}  // Ajusta según tu diseño
                        height={60}  // Ajusta según tu diseño
                        priority
                        style={{ height: 'auto' }}
                    />
                </div>

                <div className={stylesLogin.loginFormPanel}>
                    <h2 className={stylesLogin.loginFormContent}>Recuperar Contraseña</h2>

                    <form onSubmit={handleSubmit}>
                        <RecuperarContrasenaLogin label="Correo Electrónico" ref={userEmail} name="useremail" />
                        <Button type="submit" variant="contained" color="primary" fullWidth className={stylesLogin.primaryButton}>
                            Recuperar
                        </Button>
                    </form>
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

export default RecuperarContrasena