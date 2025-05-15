'use client'

import { useState, useEffect } from 'react'
import { InputNumber } from 'primereact/inputnumber'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'

const InputNumberCustom = ({ name, required, valueProp = '', specialConf, disabled }) => {
    
    const { min, max } = specialConf ?? { min: '', max: '' }
    const { valueState, setValueState } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange } = specialConf ? specialConf : false

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event) => {

        const cleanValue = DOMPurify.sanitize(event.value)

        if (min != '' && cleanValue < min) {
            return
        }

        if (max != '' && cleanValue > max) {
            return
        }

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
            <InputNumber required={required} id={name} className={stylesImputForm.customedInput} name={name} aria-describedby={name} value={value} onChange={handleChange} min={min} max={max} disabled={disabled} />
        </>
    )
}

InputNumberCustom.propTypes = {
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.number,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputNumberCustom