import PropTypes from 'prop-types'

const ConsumerPublicAPI = async ({ url, method = 'GET', headers = {}, body = {} }) => {
    const params = {
        method,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Referrer-Policy': 'no-referrer',
        },
    }

    if (method !== 'GET') {
        params.body = JSON.stringify(body)
    }
    
    try {
        const request = await fetch(url, params)

        if (!request.ok) {
            const errorResponse = await request.json().catch(() => ({}))
            return {
                status: 'error',
                message: `Error ${request.status}: ${request.statusText}`,
                data: errorResponse
            }
        }

        const response = await request.json()
        return response
    } catch (error) {
        return {
            status: 'error',
            message: `Network error: ${error.message}`,
            data: []
        }
    }
}

ConsumerPublicAPI.propTypes = {
    url: PropTypes.string.isRequired,
    method: PropTypes.string,
    headers: PropTypes.object,
    body: PropTypes.object
}

export default ConsumerPublicAPI
