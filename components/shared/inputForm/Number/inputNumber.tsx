'use client'

import { useState, useEffect } from 'react'

import DOMPurifyImport from 'dompurify'
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber'

import stylesInputForm from '../inputForm.module.css'

// --- Tipado de configuración especial ---
interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: number | null) => void
    min?: number
    max?: number
}

// --- Tipado de props ---
interface InputNumberCustomProps {
    name: string
    required?: boolean
    valueProp?: number | null
    specialConf: SpecialConf
    disabled?: boolean
}

const InputNumberCustom: React.FC<InputNumberCustomProps> = ({
    name,
    required = false,
    valueProp = null,
    specialConf,
    disabled = false,
}) => {
    const { min, max, valueState, setValueState, onChange } = specialConf
    const [value, setValue] = useState<number | null>(valueProp)
    const DOMPurify = DOMPurifyImport as typeof DOMPurifyImport

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event: InputNumberChangeEvent) => {
        const rawValue = event.value
        const cleanValue = rawValue !== null ? Number(DOMPurify.sanitize(String(rawValue))) : null

        // Validaciones de límites
        if (min !== undefined && cleanValue !== null && cleanValue < min) return
        if (max !== undefined && cleanValue !== null && cleanValue > max) return

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
        <InputNumber
            required={required}
            id={name}
            name={name}
            aria-describedby={name}
            className={stylesInputForm.customedInput}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            disabled={disabled}
            useGrouping={false}
        />
    )
}

export default InputNumberCustom
