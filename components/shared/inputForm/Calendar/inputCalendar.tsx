'use client'

import { locale, addLocale } from 'primereact/api'
import { Calendar } from 'primereact/calendar'

import stylesImputForm from '../inputForm.module.css'

// Configuración de idioma español
addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
    dayNamesMin: ['D','L','M','X','J','V','S'],
    monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
})
locale('es')

interface InputCalendarCustomProps {
    name: string
    required?: boolean
    value?: Date | null
    onChange?: (date: Date | null) => void
    disabled?: boolean
}

const InputCalendarCustom: React.FC<InputCalendarCustomProps> = ({
    name,
    required = false,
    value = null,
    onChange,
    disabled = false
}) => {
    // Convertir string a Date si es necesario
    const dateValue = value instanceof Date ? value : null

    const handleChange = (event: { value: Date | Date[] | null }) => {
        const selectedDate = Array.isArray(event.value) ? event.value[0] : event.value
        onChange?.(selectedDate ?? null)
    }

    return (
        <div className={stylesImputForm.customedInput}>
            <Calendar
                id={name}
                name={name}
                value={dateValue}
                onChange={handleChange}
                required={required}
                disabled={disabled}
                locale="es"
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Seleccionar fecha"
                showButtonBar
                yearRange="1900:2030"
                readOnlyInput={false}
                selectionMode="single"
            />
        </div>
    )
}

export default InputCalendarCustom
