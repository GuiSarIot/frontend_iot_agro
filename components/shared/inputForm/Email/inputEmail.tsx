'use client'

import { useState, useEffect, ChangeEvent } from 'react'

import DOMPurifyImport from 'dompurify'
import { InputText } from 'primereact/inputtext'

import stylesInputForm from '../inputForm.module.css'

// --- Tipado de la configuración especial ---
interface SpecialConf {
    valueState: Record<string, string>
    setValueState: (newState: Record<string, string>) => void
    onChange?: (value: string) => void
}

// --- Tipado de props ---
interface InputEmailCustomProps {
    name: string
    required?: boolean
    valueProp?: string
    specialConf: SpecialConf
    disabled?: boolean
}

const InputEmailCustom: React.FC<InputEmailCustomProps> = ({
    name,
    required = false,
    valueProp = '',
    specialConf,
    disabled = false,
}) => {
    const { valueState, setValueState, onChange } = specialConf
    const [value, setValue] = useState<string>(valueProp)
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

    return (
        <InputText
            required={required}
            id={name}
            className={stylesInputForm.customedInput}
            name={name}
            aria-describedby={name}
            value={value}
            onChange={handleChange}
            type="email"
            disabled={disabled}
        />
    )
}

export default InputEmailCustom
