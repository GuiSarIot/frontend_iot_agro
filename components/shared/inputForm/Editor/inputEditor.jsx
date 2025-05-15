'use client'

import { useState, useEffect } from 'react'
import { Editor } from 'primereact/editor'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import '@/styles/globalInputEditorReset.css'

const InputEditorAdvanced = ({ children, name, required, valueProp, specialConf, disabled }) => {

    const { valueState, setValueState } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange, size } = specialConf ? specialConf : false

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const handleChange = (event) => {

        const cleanValue = DOMPurify.sanitize(event.htmlValue)

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
            <Editor required={required} id={name} name={name} aria-describedby={name} value={value} onTextChange={handleChange} readOnly={disabled} style={size} />
            {children}
        </>
    )
}

InputEditorAdvanced.propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.string,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputEditorAdvanced