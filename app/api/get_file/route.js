import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        const { searchParams } = req.nextUrl
        const file = searchParams.get('file')
        const folder = searchParams.get('folder')
        const download = searchParams.get('download') === 'true'

        if (!file || !folder) {
            throw new Error('Faltan parámetros de consulta \'file\' o \'folder\'')
        }

        const filePath = path.join(process.cwd(), folder, file)

        const fileData = await fs.readFile(filePath)
        const ext = path.extname(file).toLowerCase()

        let contentType = 'application/octet-stream'
        switch (ext) {
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg'
            break
        case '.png':
            contentType = 'image/png'
            break
        case '.gif':
            contentType = 'image/gif'
            break
        case '.pdf':
            contentType = 'application/pdf'
            break
        case '.doc':
            contentType = 'application/msword'
            break
        case '.docx':
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            break
        case '.xls':
            contentType = 'application/vnd.ms-excel'
            break
        case '.xlsx':
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            break
        case '.csv':
            contentType = 'text/csv'
            break
        case '.ppt':
            contentType = 'application/vnd.ms-powerpoint'
            break
        case '.pptx':
            contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            break
        case '.zip':
            contentType = 'application/zip'
            break
        case '.rar':
            contentType = 'application/x-rar-compressed'
            break
        default:
            contentType = 'application/octet-stream'
            break
        }

        const headers = {
            'Content-Type': contentType,
        }
        
        if (download) {
            headers['Content-Disposition'] = `attachment; filename="${file}"`
        }

        return new Response(fileData, { headers })
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: 'Error al intentar obtener el archivo',
                error: error.toString(),
            }),
            { status: 404 }
        )
    }
}
