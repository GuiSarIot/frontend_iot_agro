'use client'

import React from 'react'

import InputDate from './Calendar/inputCalendar'
import InputCheckbox from './Checkbox/inputCheckbox'
import InputEditorAdvanced from './Editor/inputEditor'
import InputEmail from './Email/inputEmail'
import InputFile from './File/inputFile'
import stylesImputForm from './inputForm.module.css'
import InputMultiSelect from './MultiSelect/multiSelect'
import InputNumber from './Number/inputNumber'
import InputPassword from './Password/inputPasword'
import InputSelect from './Select/select'
import InputSelectButton from './SelectButton/selectButton'
import InputSelectSearh from './SelectSearch/selectFilter'
import InputText from './Text/inputText'
import InputTextarea from './TextArea/inputTextAreaCustom'

// 🔹 Definición de tipos de input disponibles
type InputType =
    | 'text'
    | 'number'
    | 'textarea'
    | 'select'
    | 'selectSearch'
    | 'selectButton'
    | 'multiselect'
    | 'password'
    | 'date'
    | 'file'
    | 'email'
    | 'editor'
    | 'checkbox'

// 🔹 Props esperadas por InputForm
interface InputFormProps {
    children?: React.ReactNode
    label: string
    type: InputType
    name: string
    specialConf?: Record<string, unknown>
    required?: boolean
    valueProp?: string | number | string[] | unknown[] | null
    disabled?: boolean
    styles?: React.CSSProperties
}

// 🔹 Mapeo de tipo → componente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inputComponents: Record<InputType, React.ComponentType<any>> = {
    text: InputText,
    number: InputNumber,
    textarea: InputTextarea,
    select: InputSelect,
    selectSearch: InputSelectSearh,
    selectButton: InputSelectButton,
    multiselect: InputMultiSelect,
    password: InputPassword,
    date: InputDate,
    file: InputFile,
    email: InputEmail,
    editor: InputEditorAdvanced,
    checkbox: InputCheckbox,
}

const getLocalISODate = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().split('T')[0]
}

const InputForm: React.FC<InputFormProps> = ({
    children,
    label,
    type,
    name,
    specialConf = {},
    required = false,
    valueProp = '',
    disabled = false,
    styles = {},
}) => {
    const InputComponent = inputComponents[type]

    const validValueProp =
        type === 'date' &&
        (!valueProp ||
            Array.isArray(valueProp) ||
            isNaN(new Date(valueProp as string | number | Date).getFullYear()))
            ? getLocalISODate()
            : valueProp

    return (
        <div className={stylesImputForm.inputForm} style={styles}>
            <label htmlFor={name}>{label}</label>
            <InputComponent
                required={required}
                name={name}
                valueProp={validValueProp}
                specialConf={specialConf}
                disabled={disabled}
            >
                {children}
            </InputComponent>
        </div>
    )
}

export default InputForm
