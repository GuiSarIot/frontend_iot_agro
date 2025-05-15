'use client'

import React, { useState, useEffect } from 'react'
import { Dropdown } from 'primereact/dropdown'
import PropTypes from 'prop-types'
import stylesImputForm from './selectFilter.module.css'

const SelecSearch = ({ name, required, valueProp, specialConf, disabled }) => {
    const { options, valueState, setValueState } = specialConf
    const [selectedOption, setSelectOption] = useState(valueProp)

    const { onChange, onChangeData } = specialConf ? specialConf : false

    useEffect(() => {
        options.forEach(option => {
            if (option.code === valueProp) {
                setSelectOption(option)
            }
        })
    }, [valueProp, options])

    const handleChange = (event) => {
        if (!event.target.value) {
            setSelectOption(null)
            setValueState({
                ...valueState,
                [name]: null
            })

            return false
        }

        setSelectOption(event.target.value)
        setValueState({
            ...valueState,
            [name]: event.target.value.code
        })

        if (onChange) {
            onChange(event.target.value.code)
        }

        if (onChangeData) {
            onChangeData(event.target.value)
        }
    }

    return (
        <div className={stylesImputForm.customedInput}>
            <Dropdown
                required={required}
                id={name}
                aria-describedby={name}
                options={options}
                value={selectedOption}
                onChange={handleChange}
                optionLabel="name"
                filter
                filterBy="name"
                showClear
                disabled={disabled}
                placeholder="Seleccionar..."
                emptyMessage="No hay opciones disponibles"
                className={stylesImputForm.dropdown}
            />
        </div>
    )
}

SelecSearch.propTypes = {
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.string,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default SelecSearch
