import PropTypes from 'prop-types'
import GetRoute from '@/components/protectedRoute/getRoute'
import Swal from 'sweetalert2'

const ConsumerAPIBlob = async ({ url, method = 'GET', headers = {}, body = {}, textLoading, textMessage, nameFile = 'archivo', extension = '.pdf' }) => {

    try {

        Swal.fire({
            title: textLoading || 'Cargando...',
            text: textMessage || 'Espere un momento por favor',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading()
            },
            allowEscapeKey: false,
        })


        const { token } = await GetRoute()

        if (token === undefined || token === null || token === 'false' || token.trim() === '') {
            return {
                status: 'error',
                message: 'Token is not valid',
                data: []
            }
        }

        const params = {
            method,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `token ${token}`,
                'Referrer-Policy': 'no-referrer',
            }
        }

        if (method != 'GET') {
            params.body = JSON.stringify(body)
        }

        const request = await fetch(url, params)
        const blob = await request.blob()

        const urlDownload = window.URL.createObjectURL(new Blob([blob]))
        const a = document.createElement('a')
        a.href = urlDownload
        a.download = `${nameFile}.${extension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        //* cerrar sweetalert
        Swal.close()

        return {
            status: 'success',
            message: 'PDF downloaded',
            data: []
        }
    } catch (error) {

        console.log(error)

        //* cerrar sweetalert
        Swal.close()

        return {
            status: 'error',
            message: 'Error downloading PDF',
            data: []
        }
    }

}

ConsumerAPIBlob.propTypes = {
    url: PropTypes.string.isRequired,
    method: PropTypes.string,
    headers: PropTypes.object,
    body: PropTypes.object,
    textLoading: PropTypes.string,
    textMessage: PropTypes.string,
    nameFile: PropTypes.string,
    extension: PropTypes.string
}

export default ConsumerAPIBlob