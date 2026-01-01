'use client'

import React, { forwardRef, useState, ChangeEvent } from 'react'

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import stylesLogin from '../styles/login.module.css'

interface InputLoginProps {
    type?: 'text' | 'password'
    name?: string
    label: string
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    className?: string
}

const InputLogin = forwardRef<HTMLInputElement, InputLoginProps>(
    ({ type = 'text', name, label, onChange, className }, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        const togglePasswordVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault()
            setShowPassword(prev => !prev)
        }

        return (
            <div className={stylesLogin.loginInputContainer}>
                <label htmlFor={name}>{label}</label>
                <div className={stylesLogin.inputWrapper}>
                    <input
                        required
                        ref={ref}
                        type={type === 'password' && showPassword ? 'text' : type}
                        name={name}
                        onChange={onChange}
                        className={`${stylesLogin.inputField} ${className ?? ''}`}
                        style={{ 
                            color: '#2c3e50',
                            WebkitTextFillColor: '#2c3e50'
                        }}
                    />
                    {type === 'password' && (
                        <button
                            onClick={togglePasswordVisibility}
                            className={stylesLogin.eyeButton}
                            aria-label="Mostrar/Ocultar contraseña"
                            type="button"
                        >
                            {showPassword ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                        </button>
                    )}
                </div>
            </div>
        )
    }
)
InputLogin.displayName = 'InputLogin'

export default InputLogin