'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'primereact/calendar'
import PropTypes from 'prop-types'
import stylesImputForm from '../inputForm.module.css'
import { locale, addLocale } from 'primereact/api'

addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
})
locale('es')

const InputCalendarCustom = ({ name, required, valueProp, specialConf, disabled }) => {

    const { valueState, setValueState } = specialConf
    const [value, setValue] = useState(null)

    useEffect(() => {
        if (valueProp) {
            let date
            // Si la fecha viene en formato "YYYY-MM-DD" (sin zona horaria)
            if (typeof valueProp === 'string' && valueProp.includes('-')) {
                
                date = new Date(valueProp + 'T00:00:00') 
                if (isNaN(date.getTime())) {
                    console.error('Fecha no válida:', valueProp)
                    return
                }
                const offset = date.getTimezoneOffset() * 60000 
                date = new Date(date.getTime() + offset)
            } else if (valueProp instanceof Date) {
                // Si la fecha ya viene en formato local (por ejemplo, "Sat Mar 22 2025 00:00:00 GMT-0500")
                date = new Date(valueProp)
                if (isNaN(date.getTime())) {
                    console.error('Fecha no válida:', valueProp)
                    return
                }
            } else {
                console.error('Formato de fecha no soportado:', valueProp)
                return
            }
            setValue(date)
        } else {
            setValue(null) 
        }
    }, [valueProp])

    const handleChange = (event) => {
        const selectedDate = event.target.value
        setValue(selectedDate)
        setValueState({
            ...valueState,
            [name]: selectedDate
        })

        if (specialConf && specialConf.onChange) {
            specialConf.onChange(selectedDate)
        }
    }

    return (
        <>
            <Calendar 
                required={required} 
                id={name} 
                className={stylesImputForm.customedInput} 
                aria-describedby={name} 
                value={value} 
                onChange={handleChange} 
                disabled={disabled} 
            />
        </>
    )
}

InputCalendarCustom.propTypes = {
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    valueProp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    specialConf: PropTypes.object.isRequired,
    disabled: PropTypes.bool
}

export default InputCalendarCustom