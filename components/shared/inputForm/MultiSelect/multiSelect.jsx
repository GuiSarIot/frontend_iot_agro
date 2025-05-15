'use client'

import { useState, useEffect } from 'react'
import { MultiSelect } from 'primereact/multiselect'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'

const InputMultiSelectCustom = ({ name, required, valueProp, specialConf, disabled }) => {

    const { options, valueState, setValueState } = specialConf
    const [selectedOptions, setSelectOptions] = useState(valueProp)


    useEffect(() => {
        if (valueProp != '' && valueProp != null) {
            const valueParsed = valueProp.map((option) => ({
                code: option.code,
                name: option.name
            }))
            
            setSelectOptions(valueParsed)
        }
    }, [valueProp])

    const handleChange = (event) => {
        if (!event.target.value) {
            setSelectOptions(null)
            setValueState({
                ...valueState,
                [name]: null
            })

            return false
        }

        setSelectOptions(event.target.value)
        setValueState({
            ...valueState,
            [name]: event.target.value
        })
    }

    return (
        <>
            <MultiSelect 
                required={required} 
                id={name} 
                className={stylesImputForm.customedInput} 
                aria-describedby={name} 
                options={options} 
                value={selectedOptions} 
                onChange={handleChange} 
                optionLabel="name" 
                filter
                filterBy="name"
                showClear 
                disabled={disabled} 
                emptyMessage="No hay opciones disponibles"
                emptyFilterMessage="No se encontraron opciones"
            />
        </>
    )
}

InputMultiSelectCustom.propTypes = {
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.array,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputMultiSelectCustom