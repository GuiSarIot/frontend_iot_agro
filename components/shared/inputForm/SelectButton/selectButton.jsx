'use client'

import { useState, useEffect } from 'react'
import { SelectButton } from 'primereact/selectbutton'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'

const InputTextCustom = ({ children, name, required, valueProp, specialConf, disabled }) => {

    const { options, valueState, setValueState } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange } = specialConf ? specialConf : false

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])
    
    const handleChange = (event) => {

        setValue(event.target.value)
        
        setValueState({
            ...valueState,
            [name]: event.target.value
        })

        if (onChange) {
            onChange(event.target.value)
        }
    }

    return (
        <>
            <SelectButton required={required} id={name} className={stylesImputForm.customedInput} name={name} aria-describedby={name} value={value} onChange={handleChange} options={options} disabled={disabled}/>
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