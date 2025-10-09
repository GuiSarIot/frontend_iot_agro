import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    try {
        const data = await request.formData()

        const file = data.get('file') as File | null
        const nomb = data.get('nameImg') as string | null

        if (!file) {
            return new Response(
                JSON.stringify({ message: 'No file uploaded' }),
                { status: 400 }
            )
        }

        const fileInfo = path.parse(file.name)
        const fileExt = fileInfo.ext

        // Nuevo nombre del archivo con la misma extensión
        const fileName = nomb ? `${nomb}${fileExt}` : file.name

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const filePath = path.join(process.cwd(), 'images/users', fileName)
        await writeFile(filePath, buffer)

        return new Response(
            JSON.stringify({ message: 'Uploading file...' }),
            { status: 200 }
        )
    } catch (error: unknown) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : 'Unknown error'
        return new Response(
            JSON.stringify({ message: `No file uploaded: ${errorMessage}` }),
            { status: 400 }
        )
    }
}
