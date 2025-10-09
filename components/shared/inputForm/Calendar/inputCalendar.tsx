'use client'

import { useState, useEffect } from 'react'

import { locale, addLocale } from 'primereact/api'
import { Calendar } from 'primereact/calendar'

import stylesImputForm from '../inputForm.module.css'

// Configuración de idioma español
addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
})
locale('es')

// Tipado de configuración especial
interface SpecialConf {
    valueState: Record<string, unknown>
    setValueState: (newState: Record<string, unknown>) => void
    onChange?: (value: Date | null) => void
}

interface InputCalendarCustomProps {
    name: string
    required?: boolean
    valueProp?: string | Date | null
    specialConf: SpecialConf
    disabled?: boolean
}

const InputCalendarCustom: React.FC<InputCalendarCustomProps> = ({
    name,
    required = false,
    valueProp = null,
    specialConf,
    disabled = false
}) => {
    const { valueState, setValueState, onChange } = specialConf
    const [value, setValue] = useState<Date | null>(null)

    // Convertir la fecha entrante
    useEffect(() => {
        if (valueProp) {
            let date: Date | null = null
            if (typeof valueProp === 'string' && valueProp.includes('-')) {
                date = new Date(`${valueProp}T00:00:00`)
                if (isNaN(date.getTime())) return console.error('Fecha no válida:', valueProp)
                const offset = date.getTimezoneOffset() * 60000
                date = new Date(date.getTime() + offset)
            } else if (valueProp instanceof Date) {
                date = new Date(valueProp)
                if (isNaN(date.getTime())) return console.error('Fecha no válida:', valueProp)
            } else {
                console.error('Formato de fecha no soportado:', valueProp)
                return
            }
            setValue(date)
        } else {
            setValue(null)
        }
    }, [valueProp])

    // Manejador de cambio
    const handleChange = (event: { value: Date | null }) => {
        const selectedDate = event.value
        setValue(selectedDate)
        setValueState({
            ...valueState,
            [name]: selectedDate
        })
        onChange?.(selectedDate)
    }

    return (
        <Calendar
            required={required}
            id={name}
            className={stylesImputForm.customedInput}
            aria-describedby={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            locale="es"
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Seleccionar fecha"
        />
    )
}

export default InputCalendarCustom
