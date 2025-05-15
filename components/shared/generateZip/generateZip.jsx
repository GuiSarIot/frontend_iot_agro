import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const GenerateZip = async (files) => {
    if (!files || files.length === 0) {
        console.error('No se recibieron archivos para incluir en el ZIP')
        return
    }

    const zip = new JSZip()

    // Recorrer los archivos y añadirlos al ZIP
    files.forEach((file) => {
        if (file.file instanceof Blob) {
            zip.file(`${file.name}.csv`, file.file) // Agregar el Blob directamente
        } else {
            console.warn(`Archivo ${file.name} no es un Blob válido`)
        }
    })

    // Generar el ZIP como Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    console.log('ZIP generado:', zipBlob)
    // Descargar el ZIP
    saveAs(zipBlob, 'MonitoreoFichas.zip')
}


export default GenerateZip