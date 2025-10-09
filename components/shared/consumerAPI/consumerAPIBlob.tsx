import Swal from 'sweetalert2'

// Update the import path to the correct relative location
import GetRoute from '../../protectedRoute/getRoute'

interface ConsumerAPIBlobParams {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    body?: Record<string, unknown>
    textLoading?: string
    textMessage?: string
    nameFile?: string
    extension?: string
}

interface ConsumerAPIResponse<T = unknown> {
    status: 'success' | 'error'
    message: string
    data: T
}

// This is now a utility function, not a client component
function ConsumerAPIBlob({
    url,
    method = 'GET',
    headers = {},
    body = {},
    textLoading,
    textMessage,
    nameFile = 'archivo',
    extension = '.pdf'
}: ConsumerAPIBlobParams): Promise<ConsumerAPIResponse> {
    return new Promise((resolve) => {
        (async () => {
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

                if (!token || token === 'false' || token.trim() === '') {
                    Swal.close()
                    resolve({
                        status: 'error',
                        message: 'Token is not valid',
                        data: []
                    })
                    return
                }

                const params: RequestInit = {
                    method,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                        'Authorization': `token ${token}`,
                        'Referrer-Policy': 'no-referrer',
                    },
                }

                if (method !== 'GET') {
                    params.body = JSON.stringify(body)
                }

                const request = await fetch(url, params)
                const blob = await request.blob()

                const urlDownload = window.URL.createObjectURL(new Blob([blob]))
                const a = document.createElement('a')
                a.href = urlDownload
                a.download = `${nameFile}${extension.startsWith('.') ? extension : '.' + extension}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)

                Swal.close()

                resolve({
                    status: 'success',
                    message: 'PDF downloaded',
                    data: []
                })
            } catch (error) {
                console.error(error)
                Swal.close()
                resolve({
                    status: 'error',
                    message: 'Error downloading PDF',
                    data: []
                })
            }
        })()
    })
}

export default ConsumerAPIBlob
