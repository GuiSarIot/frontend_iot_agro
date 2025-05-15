'use client'

import { useState, useEffect } from 'react'
import { InputTextarea } from 'primereact/inputtextarea'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'

const InputTextAreaCustom = ({ children, name, required, valueProp, specialConf, disabled }) => {

    const { valueState, setValueState } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange } = specialConf ? specialConf : false

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

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
            <InputTextarea required={required} id={name} className={stylesImputForm.customedInput} name={name} aria-describedby={name} value={value} onChange={handleChange} rows={2} cols={30} disabled={disabled}/>
            {children}
        </>
    )
}

InputTextAreaCustom.propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.string,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputTextAreaCustom