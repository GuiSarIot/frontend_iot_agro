'use client'

import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface FileToZip {
    name: string
    file: Blob
}

function GenerateZip(files: FileToZip[]): Promise<void> {
    if (!files || files.length === 0) {
        console.error('No se recibieron archivos para incluir en el ZIP')
        return Promise.resolve()
    }

    const zip = new JSZip()

    // Recorrer los archivos y añadirlos al ZIP
    files.forEach((file) => {
        if (file.file instanceof Blob) {
            zip.file(`${file.name}.csv`, file.file)
        } else {
            console.warn(`Archivo ${file.name} no es un Blob válido`)
        }
    })

    return zip.generateAsync({ type: 'blob' })
        .then((zipBlob) => {
            saveAs(zipBlob, 'MonitoreoFichas.zip')
        })
        .catch((error) => {
            console.error('Error generando el ZIP:', error)
        })
}

export default GenerateZip
