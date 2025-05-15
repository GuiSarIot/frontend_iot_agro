'use client'

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'

const InputFile = ({ children, name, required, valueProp, specialConf, disabled }) => {

    const { valueState, setValueState, nameLabel, accept } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange, onChangeSecondary } = specialConf ? specialConf : false

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event) => {
        const infoFile = event.target.files[0]

        const extensionFile = infoFile.name.split('.').pop()

        setValue(event.target.value)
        setValueState({
            ...valueState,
            [name]: {
                infoFile,
                type: extensionFile
            }
        })

        if (onChange) {
            onChange(event.target.value)
        }

        if (onChangeSecondary) {
            onChangeSecondary()
        }
    }

    return (
        <>
            <label className={stylesImputForm.inputFileLabel} htmlFor={name}>{nameLabel}</label>
            <input accept={accept} type="file" value={value} name={name} id={name} onChange={handleChange} required={required} className={stylesImputForm.inputFile} disabled={disabled} />
            {children}
        </>
    )

}

InputFile.propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.string,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputFile