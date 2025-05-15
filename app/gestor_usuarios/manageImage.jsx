import Swal from 'sweetalert2'

const ManageImage = async (inputsValues) => {

    // console.log('inputsValues', inputsValues)

    try {
        //* states
        const { numeroDocumento, profilePicture } = inputsValues
        const { infoFile } = profilePicture

        if (!infoFile) {
            Swal.fire({
                title: 'Ops...!',
                text: 'Debe seleccionar una imagen',
                icon: 'error',
            })

            return false
        }

        const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

        if (!allowedFormats.includes(infoFile.type)) {
            Swal.fire({
                title: 'Ops...!',
                text: 'Formato de imagen no válido. Por favor, seleccione una imagen en formato JPG, JPEG, PNG o GIF.',
                icon: 'error',
            })

            return false
        }

        const imgData = new FormData()
        imgData.set('file', infoFile)
        imgData.set('nameImg', numeroDocumento)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: imgData,
        })

        if (!res.ok) {
            Swal.fire({
                title: 'Ops...!',
                text: 'Ha ocurrido un error al cargar la imagen',
                icon: 'error',
            })
            return false
        }

        return true

    } catch (error) {

        Swal.fire({
            title: 'Ops...!',
            text: error.message,
            icon: 'error',
        })

        return false
    }
}

export default ManageImage
