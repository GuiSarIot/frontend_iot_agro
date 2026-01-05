'use client'

import React from 'react'

import styles from './inputCheckbox.module.css'

interface InputCheckboxProps {
    name: string
    required?: boolean
    disabled?: boolean
    valueProp?: boolean
    specialConf?: {
        valueState?: Record<string, unknown>
        setValueState?: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
        onChange?: (checked: boolean) => void
    }
}

const InputCheckbox: React.FC<InputCheckboxProps> = ({
    name,
    required = false,
    disabled = false,
    valueProp = false,
    specialConf = {},
}) => {
    const { valueState = {}, setValueState, onChange } = specialConf

    const currentValue = valueState[name] !== undefined ? Boolean(valueState[name]) : Boolean(valueProp)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked

        if (setValueState) {
            setValueState((prevState: Record<string, unknown>) => ({
                ...prevState,
                [name]: checked,
            }))
        }

        if (onChange) {
            onChange(checked)
        }
    }

    return (
        <div className={styles.checkboxContainer}>
            <input
                type="checkbox"
                id={name}
                name={name}
                required={required}
                disabled={disabled}
                checked={currentValue}
                onChange={handleChange}
                className={styles.checkbox}
            />
        </div>
    )
}

export default InputCheckbox
