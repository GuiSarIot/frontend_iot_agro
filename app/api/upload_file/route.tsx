import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    try { 
        const data = await request.formData()
        
        const file = data.get('file') as File | null
        const nameFile = data.get('nameFile') as string | null

        if (!file) {
            return new Response(
                JSON.stringify({ message: 'No file uploaded' }),
                { status: 400 }
            )
        }

        const fileInfo = path.parse(file.name)
        const fileExt = fileInfo.ext

        // Nuevo nombre del archivo con la misma extensión
        const fileName = nameFile ? `${nameFile}${fileExt}` : file.name

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const filePath = path.join(process.cwd(), '/public/upload/itemsDesingCurricular', fileName)
        await writeFile(filePath, buffer)

        return new Response(
            JSON.stringify({ message: 'Uploading file...' }),
            { status: 200 }
        )
    
    } catch (error: unknown) {
        let errorMessage = 'Unknown error'
        if (error instanceof Error) {
            errorMessage = error.message
        }
        return new Response(
            JSON.stringify({ message: 'Error uploading file', error: errorMessage }),
            { status: 400 }
        )
    }
}
