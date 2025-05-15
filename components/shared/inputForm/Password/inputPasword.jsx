'use client'


import { useState, useEffect } from 'react'
import { Password } from 'primereact/password'
import { InputText } from 'primereact/inputtext'
import DOMPurify from 'dompurify'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const InputPasswordCustom = ({ name, required, valueProp, specialConf, disabled }) => {

    const { valueState, setValueState } = specialConf
    const [value, setValue] = useState(valueProp)
    const { onChange } = specialConf ? specialConf : false
    const [isShowPassword, setIsShowPassword] = useState(false)

    const IconPassword = isShowPassword ? VisibilityOffIcon : RemoveRedEyeIcon

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

    const handleShowPass = (event) => {
        event.preventDefault()
        setIsShowPassword(!isShowPassword)
    }

    return (
        <div style={{position: 'relative'}}>
            {
                isShowPassword 
                    ? <InputText required={required} id={name} className={stylesImputForm.customedInput} name={name} aria-describedby={name} value={value} onChange={handleChange} disabled={disabled}/>
                    : <Password required={required} id={name} className={stylesImputForm.customedInput} onChange={handleChange} value={value} aria-describedby={name} feedback={false} disabled={disabled} />
            }
            
            <button className={stylesImputForm.customedInputButton} onClick={handleShowPass} style={{ marginTop: '2px' }}>
                <IconPassword fontSize="small" />
            </button>
        </div>
    )
}

InputPasswordCustom.propTypes = {
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.string,
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputPasswordCustom