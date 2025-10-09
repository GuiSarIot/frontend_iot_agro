'use client'

import { useState, useEffect, ReactNode, ChangeEvent, FocusEvent } from 'react'

import DOMPurifyImport from 'dompurify'
import { InputText } from 'primereact/inputtext'

import stylesInputForm from '../inputForm.module.css'

// Tipado para la configuración especial
interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: string) => void
    onBlur?: (value: string) => void
}

interface InputTextCustomProps {
    children?: ReactNode
    name: string
    required?: boolean
    valueProp?: string
    specialConf: SpecialConf
    disabled?: boolean
}

const InputTextCustom: React.FC<InputTextCustomProps> = ({
    children,
    name,
    required = false,
    valueProp = '',
    specialConf,
    disabled = false,
}) => {
    const { valueState, setValueState, onChange, onBlur } = specialConf

    const [value, setValue] = useState<string>(valueProp)

    const DOMPurify = DOMPurifyImport as typeof DOMPurifyImport

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        if (onBlur) onBlur(event.target.value)
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const cleanValue = DOMPurify.sanitize(event.target.value)
        setValue(cleanValue)

        setValueState({
            ...valueState,
            [name]: cleanValue,
        })

        if (onChange) onChange(cleanValue)
    }

    return (
        <>
            <InputText
                required={required}
                id={name}
                name={name}
                aria-describedby={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                className={stylesInputForm.customedInput}
            />
            {children}
        </>
    )
}

export default InputTextCustom
