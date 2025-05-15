'use client'

import PropTypes from 'prop-types'
import InputText from './Text/inputText'
import InputTextarea from './TextArea/inputTextAreaCustom'
import InputNumber from './Number/inputNumber'
import InputSelect from './Select/select'
import InputSelectSearh from './SelectSearch/selectFilter'
import InputMultiSelect from './MultiSelect/multiSelect'
import InputPassword from './Password/inputPasword'
import InputDate from './Calendar/inputCalendar'
import InputFile from './File/inputFile'
import InputEmail from './Email/inputEmail'
import InputEditorAdvanced from './Editor/inputEditor'
import InputSelectButton from './SelectButton/selectButton'
import stylesImputForm from './inputForm.module.css'

const inputComponents = {
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
}

const getLocalISODate = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().split('T')[0]
}

const InputForm = ({ children, label, type, name, specialConf, required = false, valueProp = '', disabled = false, styles = {} }) => {
    const InputComponent = inputComponents[type]

    const validValueProp = type === 'date' && (!valueProp || isNaN(new Date(valueProp).getFullYear()))
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

InputForm.propTypes = {
    children: PropTypes.node,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'number', 'textarea', 'select', 'multiselect', 'password', 'date', 'file', 'email', 'editor', 'selectButton']).isRequired,
    name: PropTypes.string.isRequired,
    specialConf: PropTypes.object.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool,
    styles: PropTypes.object
}

export default InputForm