import Swal from 'sweetalert2'

// ---- Interfaces ----
interface InfoFile {
    type: string
    // Add other metadata if needed
    [key: string]: unknown
}

interface ProfilePicture {
    file?: File // Store the actual file object
    infoFile?: InfoFile
    [key: string]: unknown
}

interface InputsValues {
    numeroDocumento: string | number
    profilePicture: ProfilePicture
    [key: string]: unknown
}

// ---- Función principal ----
const ManageImage = async (inputsValues: InputsValues): Promise<boolean> => {
    try {
        const { profilePicture } = inputsValues
        const { file, infoFile } = profilePicture

        if (!file || !infoFile) {
            Swal.fire({
                title: 'Ops...!',
                text: 'Debe seleccionar una imagen',
                icon: 'error'
            })
            return false
        }

        const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

        if (!allowedFormats.includes(file.type)) {
            Swal.fire({
                title: 'Ops...!',
                text: 'Formato de imagen no válido. Por favor, seleccione una imagen en formato JPG, JPEG, PNG o GIF.',
                icon: 'error'
            })
            return false
        }

        const imgData = new FormData()
        imgData.set('file', file)
        imgData.set('nameImg', String(inputsValues.numeroDocumento))
        imgData.set('infoFile', JSON.stringify(infoFile))
        imgData.set('nameImg', String(inputsValues.numeroDocumento))

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: imgData
        })

        if (!res.ok) {
            Swal.fire({
                title: 'Ops...!',
                text: 'Ha ocurrido un error al cargar la imagen',
                icon: 'error'
            })
            return false
        }

        return true
    } catch (error: unknown) {
        let errorMessage = 'Ha ocurrido un error inesperado'
        if (error instanceof Error) {
            errorMessage = error.message
        }
        Swal.fire({
            title: 'Ops...!',
            text: errorMessage,
            icon: 'error'
        })
        return false
    }
}

export default ManageImage