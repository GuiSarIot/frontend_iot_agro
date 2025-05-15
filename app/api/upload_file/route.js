import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request) {
    try { 
        const data = await request.formData()
        
        const file = data.get('file')
        const nameFile = data.get('nameFile')

        const fileInfo = path.parse(file.name)
        const fileExt = fileInfo.ext
        
        // Nuevo nombre del archivo con la misma extensión
        const fileName =  nameFile ? `${nameFile}${fileExt}` : file.name

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const filePath = path.join(process.cwd(), '/public/upload/itemsDesingCurricular', fileName)
        await writeFile(filePath, buffer)
        return new Response(JSON.stringify({ message: 'Uploading file...' }))
    } catch (error) {
        return new Response(
            JSON.stringify({ message: 'No file uploaded' }),
            { status: 400 }
        )
    }
}
