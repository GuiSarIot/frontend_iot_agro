'use client'

import { useState, useEffect, ReactNode, ChangeEvent } from 'react'

import DOMPurifyImport from 'dompurify'
import { InputTextarea } from 'primereact/inputtextarea'

import stylesInputForm from '../inputForm.module.css'

// Tipado para la configuración especial
interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: string) => void
}

interface InputTextAreaCustomProps {
    children?: ReactNode
    name: string
    required?: boolean
    valueProp?: string
    specialConf: SpecialConf
    disabled?: boolean
}

const InputTextAreaCustom: React.FC<InputTextAreaCustomProps> = ({
    children,
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

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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
            <InputTextarea
                required={required}
                id={name}
                name={name}
                aria-describedby={name}
                value={value}
                onChange={handleChange}
                rows={2}
                cols={30}
                disabled={disabled}
                className={stylesInputForm.customedInput}
            />
            {children}
        </>
    )
}

export default InputTextAreaCustom
