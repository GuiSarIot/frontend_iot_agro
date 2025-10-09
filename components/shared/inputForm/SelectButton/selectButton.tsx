'use client'

import { useState, useEffect, ReactNode } from 'react'

import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton'

import stylesInputForm from '../inputForm.module.css'

// Tipado de las opciones del SelectButton
interface Option {
    label: string
    value: string | number | boolean
}

// Tipado del objeto de configuración
interface SpecialConf {
    options: Option[]
    valueState: Record<string, string | number | boolean>
    setValueState: (newState: Record<string, string | number | boolean>) => void
    onChange?: (value: string | number | boolean) => void
}

// Tipado de las props del componente
interface InputSelectButtonCustomProps {
    children?: ReactNode
    name: string
    required?: boolean
    valueProp?: string | number | boolean | null
    specialConf: SpecialConf
    disabled?: boolean
}

const InputSelectButtonCustom: React.FC<InputSelectButtonCustomProps> = ({
    children,
    name,
    required = false,
    valueProp = null,
    specialConf,
    disabled = false,
}) => {
    const { options, valueState, setValueState, onChange } = specialConf
    const [value, setValue] = useState<string | number | boolean | null>(valueProp)

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event: SelectButtonChangeEvent) => {
        const newValue = event.value
        setValue(newValue)

        setValueState({
            ...valueState,
            [name]: newValue,
        })

        if (onChange) {
            onChange(newValue)
        }
    }

    return (
        <>
            <SelectButton
                required={required}
                id={name}
                name={name}
                aria-describedby={name}
                className={stylesInputForm.customedInput}
                value={value}
                onChange={handleChange}
                options={options}
                disabled={disabled}
            />
            {children}
        </>
    )
}

export default InputSelectButtonCustom
