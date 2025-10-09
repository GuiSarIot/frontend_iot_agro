'use client'

import React, { forwardRef, ChangeEvent } from 'react'

import stylesLogin from '../styles/recuperar_contrasena.module.css'

interface RecuperarContrasenaLoginProps {
    type?: 'mail'
    name?: string
    label: string
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    className?: string
}

const RecuperarContrasenaLogin = forwardRef<HTMLInputElement, RecuperarContrasenaLoginProps>(
    ({ type = 'mail', name, label, onChange, className }, ref) => {


        return (
            <div className={stylesLogin.loginInputContainer}>
                <label htmlFor={name}>{label}</label>
                <div className={stylesLogin.inputWrapper}>
                    <input
                        required
                        ref={ref}
                        type={type === 'mail' ? 'email' : 'text'}
                        name={name}
                        onChange={onChange}
                        className={`${stylesLogin.inputField} ${className ?? ''}`}
                    />
                </div>
            </div>
        )
    }
)
RecuperarContrasenaLogin.displayName = 'RecuperarContrasenaLogin'

export default RecuperarContrasenaLogin