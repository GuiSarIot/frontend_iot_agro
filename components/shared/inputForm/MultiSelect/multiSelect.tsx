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
    name?: string
    required?: boolean
    valueProp?: OptionType[] | null
    specialConf?: SpecialConf
    disabled?: boolean
    // Props alternativas para uso directo (compatible con PrimeReact)
    data?: OptionType[]
    onChange?: (value: OptionType[] | null) => void
    optionLabel?: string
    placeholder?: string
    maxSelectedLabels?: number
    filter?: boolean
    filterPlaceholder?: string
    emptyFilterMessage?: string
    className?: string
}

const InputMultiSelectCustom: React.FC<InputMultiSelectCustomProps> = ({
    name = 'multiselect',
    required = false,
    valueProp = null,
    specialConf,
    disabled = false,
    // Props alternativas
    data,
    onChange: onChangeProp,
    optionLabel = 'name',
    placeholder = 'Seleccione opciones',
    maxSelectedLabels = 3,
    filter = false,
    filterPlaceholder = 'Buscar...',
    emptyFilterMessage = 'No se encontraron opciones',
    className = '',
}) => {
    // Determinar si se está usando modo especialConf o modo directo
    const isSpecialConfMode = specialConf !== undefined
    
    // En modo specialConf, usar sus valores; en modo directo, usar las props alternativas
    const options = isSpecialConfMode ? specialConf.options : (data || [])
    const valueState = isSpecialConfMode ? specialConf.valueState : null
    const setValueState = isSpecialConfMode ? specialConf.setValueState : null
    const onChangeCallback = isSpecialConfMode ? specialConf.onChange : onChangeProp
    
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
        
        // Solo actualizar valueState si estamos en modo specialConf
        if (isSpecialConfMode && setValueState && valueState) {
            setValueState({
                ...valueState,
                [name]: newValue,
            })
        }

        // Llamar al callback onChange si existe
        if (onChangeCallback) {
            onChangeCallback(newValue)
        }
    }

    return (
        <MultiSelect
            required={required}
            id={name}
            name={name}
            className={className || stylesInputForm.customedInput}
            aria-describedby={name}
            options={options}
            value={selectedOptions}
            onChange={handleChange}
            optionLabel={optionLabel}
            placeholder={placeholder}
            maxSelectedLabels={maxSelectedLabels}
            filter={filter}
            filterPlaceholder={filterPlaceholder}
            showClear
            disabled={disabled}
            emptyMessage="No hay opciones disponibles"
            emptyFilterMessage={emptyFilterMessage}
        />
    )
}

export default InputMultiSelectCustom
