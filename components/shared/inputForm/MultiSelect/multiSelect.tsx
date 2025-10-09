'use client'

import { useState, useEffect } from 'react'

import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect'

import stylesInputForm from '../inputForm.module.css'

// --- Tipado de opción ---
interface OptionType {
    code: string | number
    name: string
}

// --- Tipado de configuración especial ---
interface SpecialConf {
    options: OptionType[]
    valueState: Record<string, OptionType[] | null>
    setValueState: (newState: Record<string, OptionType[] | null>) => void
    onChange?: (value: OptionType[] | null) => void
}

// --- Tipado de props ---
interface InputMultiSelectCustomProps {
    name: string
    required?: boolean
    valueProp?: OptionType[] | null
    specialConf: SpecialConf
    disabled?: boolean
}

const InputMultiSelectCustom: React.FC<InputMultiSelectCustomProps> = ({
    name,
    required = false,
    valueProp = null,
    specialConf,
    disabled = false,
}) => {
    const { options, valueState, setValueState, onChange } = specialConf
    const [selectedOptions, setSelectedOptions] = useState<OptionType[] | null>(valueProp ?? null)

    useEffect(() => {
        if (valueProp && valueProp.length > 0) {
            const parsedValues = valueProp.map((option) => ({
                code: option.code,
                name: option.name,
            }))
            setSelectedOptions(parsedValues)
        } else {
            setSelectedOptions(null)
        }
    }, [valueProp])

    const handleChange = (event: MultiSelectChangeEvent) => {
        const newValue = event.value || null

        setSelectedOptions(newValue)
        setValueState({
            ...valueState,
            [name]: newValue,
        })

        if (onChange) {
            onChange(newValue)
        }
    }

    return (
        <MultiSelect
            required={required}
            id={name}
            name={name}
            className={stylesInputForm.customedInput}
            aria-describedby={name}
            options={options}
            value={selectedOptions}
            onChange={handleChange}
            optionLabel="name"
            filter
            filterBy="name"
            showClear
            disabled={disabled}
            emptyMessage="No hay opciones disponibles"
            emptyFilterMessage="No se encontraron opciones"
        />
    )
}

export default InputMultiSelectCustom
