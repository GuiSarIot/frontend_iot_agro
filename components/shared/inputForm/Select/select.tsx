'use client'

import { useState, useEffect } from 'react'

import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'

import stylesInputForm from '../inputForm.module.css'

// Tipado de una opción del dropdown
interface Option {
    name: string
    code: string
    [key: string]: unknown
}

// Tipado de la configuración especial
interface SpecialConf {
    options: Option[]
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: string | null) => void
    onChangeData?: (option: Option | null) => void
}

// Tipado de las props del componente
interface InputSelectCustomProps {
    name: string
    required?: boolean
    valueProp?: string | null
    specialConf: SpecialConf
    disabled?: boolean
}

const InputSelectCustom: React.FC<InputSelectCustomProps> = ({
    name,
    required = false,
    valueProp = null,
    specialConf,
    disabled = false,
}) => {
    const { options, valueState, setValueState, onChange, onChangeData } = specialConf
    const [selectedOption, setSelectedOption] = useState<Option | null>(null)

    // Sincroniza el valor inicial con las opciones disponibles
    useEffect(() => {
        const matchedOption = options.find(option => option.code === valueProp) || null
        setSelectedOption(matchedOption)
    }, [valueProp, options])

    const handleChange = (event: DropdownChangeEvent) => {
        const selected = event.value as Option | null

        setSelectedOption(selected)
        setValueState({
            ...valueState,
            [name]: selected ? selected.code : null,
        })

        if (onChange) onChange(selected ? selected.code : null)
        if (onChangeData) onChangeData(selected)
    }

    return (
        <Dropdown
            required={required}
            id={name}
            aria-describedby={name}
            options={options}
            value={selectedOption}
            onChange={handleChange}
            optionLabel="name"
            showClear
            disabled={disabled}
            emptyMessage="No hay opciones disponibles"
            className={stylesInputForm.customedInput}
        />
    )
}

export default InputSelectCustom
