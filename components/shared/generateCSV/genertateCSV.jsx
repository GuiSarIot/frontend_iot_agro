'use client'

import { saveAs } from 'file-saver'
import Swal from 'sweetalert2'

const TEXTSUCCESS = 'Archivo generado'
const TEXTERROR = 'Error al generar el archivo'

const parseToCsv = (data) => {
    if (!data || !data.length) return ''

    const headers = Object.keys(data[0])
    const rows = data.map(obj => headers.map(header => obj[header] ?? '').join(';'))

    return [headers.join(';'), ...rows].join('\n')
}

const GenerateCSV = ({ data, fileName, textSuccess = TEXTSUCCESS, textErrorEmpty = TEXTERROR, shouldDownload = true }) => {
    try {
        if (!data || !data.length) {
            Swal.fire({
                title: 'Upss...',
                text: textErrorEmpty + fileName,
                icon: 'info'
            })
            return false
        }

        const csvContent = parseToCsv(data)

        if (!csvContent) {
            Swal.fire({
                title: 'Upss...',
                text: 'Datos inválidos para generar CSV ' + fileName,
                icon: 'error'
            })
            return false
        }

        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })

        if (shouldDownload) {
            // Descargar el archivo
            saveAs(blob, `${fileName}.csv`)

            Swal.fire({
                title: 'Exitoso',
                text: textSuccess,
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })

            return true
        } else {
            // Retornar el archivo Blob
            return blob
        }

    } catch (error) {
        console.error('Error al procesar la respuesta:', error)
        Swal.fire({
            title: 'Upss...',
            text: 'Error al generar el archivo ' + fileName,
            icon: 'error'
        })

        return false
    }
}

export default GenerateCSV
