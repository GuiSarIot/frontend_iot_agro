'use client'

import { useState, useEffect, ChangeEvent, ReactNode } from 'react'

import stylesInputForm from '../inputForm.module.css'

// --- Tipado de la configuración especial ---
interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    nameLabel: string
    accept?: string
    onChange?: (value: string) => void
    onChangeSecondary?: () => void
}

// --- Tipado de props ---
interface InputFileProps {
    children?: ReactNode
    name: string
    required?: boolean
    valueProp?: string
    specialConf: SpecialConf
    disabled?: boolean
}

const InputFile: React.FC<InputFileProps> = ({
    children,
    name,
    required = false,
    valueProp = '',
    specialConf,
    disabled = false,
}) => {
    const { valueState, setValueState, nameLabel, accept, onChange, onChangeSecondary } = specialConf
    const [value, setValue] = useState<string>(valueProp)

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const extension = file.name.split('.').pop() || ''

        setValue(event.target.value)

        setValueState({
            ...valueState,
            [name]: {
                infoFile: file,
                type: extension,
            },
        })

        if (onChange) {
            onChange(event.target.value)
        }

        if (onChangeSecondary) {
            onChangeSecondary()
        }
    }

    return (
        <>
            <label className={stylesInputForm.inputFileLabel} htmlFor={name}>
                {nameLabel}
            </label>
            <input
                accept={accept}
                type="file"
                value={value}
                name={name}
                id={name}
                onChange={handleChange}
                required={required}
                className={stylesInputForm.inputFile}
                disabled={disabled}
            />
            {children}
        </>
    )
}

export default InputFile
