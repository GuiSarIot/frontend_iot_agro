'use client'

import { useState, useEffect } from 'react'
import { InputText } from 'primereact/inputtext'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'

const InputTextCustom = ({ children, name, required, valueProp, specialConf, disabled }) => {

    const { valueState, setValueState } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange, onBlur } = specialConf ? specialConf : false

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleBlur = (event) => {
        if (onBlur){
            onBlur(event.target.value)
        }
    }
    
    const handleChange = (event) => {

        const cleanValue = DOMPurify.sanitize(event.target.value)

        setValue(cleanValue)
        
        setValueState({
            ...valueState,
            [name]: cleanValue
        })

        if (onChange) {
            onChange(cleanValue)
        }
    }

    return (
        <>
            <InputText required={required} id={name} className={stylesImputForm.customedInput} name={name} aria-describedby={name} value={value} onChange={handleChange} onBlur={handleBlur} disabled={disabled}/>
            {children}
        </>
    )
}

InputTextCustom.propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.string,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputTextCustom