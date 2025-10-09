'use client'

import { useState, useEffect, MouseEvent, ChangeEvent } from 'react'

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import DOMPurifyImport from 'dompurify'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'


import stylesInputForm from '../inputForm.module.css'

// --- Tipos de configuración y props ---

interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: string) => void
}

interface InputPasswordCustomProps {
    name: string
    required?: boolean
    valueProp?: string
    specialConf: SpecialConf
    disabled?: boolean
}

const InputPasswordCustom: React.FC<InputPasswordCustomProps> = ({
    name,
    required = false,
    valueProp = '',
    specialConf,
    disabled = false,
}) => {
    const { valueState, setValueState, onChange } = specialConf
    const [value, setValue] = useState<string>(valueProp)
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)

    const IconPassword = isShowPassword ? VisibilityOffIcon : RemoveRedEyeIcon
    const DOMPurify = DOMPurifyImport as typeof DOMPurifyImport
    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const cleanValue = DOMPurify.sanitize(event.target.value)
        setValue(cleanValue)

        setValueState({
            ...valueState,
            [name]: cleanValue,
        })

        if (onChange) {
            onChange(cleanValue)
        }
    }

    const handleShowPass = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        setIsShowPassword((prev) => !prev)
    }

    return (
        <div style={{ position: 'relative' }}>
            {isShowPassword ? (
                <InputText
                    required={required}
                    id={name}
                    className={stylesInputForm.customedInput}
                    name={name}
                    aria-describedby={name}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    type="text"
                />
            ) : (
                <Password
                    required={required}
                    id={name}
                    className={stylesInputForm.customedInput}
                    onChange={handleChange}
                    value={value}
                    aria-describedby={name}
                    feedback={false}
                    disabled={disabled}
                    toggleMask={false}
                />
            )}

            <button
                className={stylesInputForm.customedInputButton}
                onClick={handleShowPass}
                style={{ marginTop: '2px' }}
                type="button"
            >
                <IconPassword fontSize="small" />
            </button>
        </div>
    )
}

export default InputPasswordCustom
