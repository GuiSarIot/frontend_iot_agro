'use client'

import { useState, useEffect } from 'react'

import DOMPurifyImport from 'dompurify'
import { Editor, EditorTextChangeEvent } from 'primereact/editor'

import '@/styles/globalInputEditorReset.css'

interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: string) => void
    size?: React.CSSProperties
}

interface InputEditorAdvancedProps {
    children?: React.ReactNode
    name: string
    required?: boolean
    valueProp?: string
    specialConf: SpecialConf
    disabled?: boolean
}

const InputEditorAdvanced: React.FC<InputEditorAdvancedProps> = ({
    children,
    name,
    required = false,
    valueProp = '',
    specialConf,
    disabled = false,
}) => {
    const { valueState, setValueState, onChange, size } = specialConf
    const [value, setValue] = useState<string>(valueProp)
    const DOMPurify = DOMPurifyImport as typeof DOMPurifyImport
    
    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event: EditorTextChangeEvent) => {
        const cleanValue = DOMPurify.sanitize(event.htmlValue || '')

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
        <>
            <Editor
                required={required}
                id={name}
                name={name}
                aria-describedby={name}
                value={value}
                onTextChange={handleChange}
                readOnly={disabled}
                style={size}
            />
            {children}
        </>
    )
}

export default InputEditorAdvanced
