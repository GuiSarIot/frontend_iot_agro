// 📦 Importaciones de módulos y componentes
import type { ReactNode } from 'react'

// 🌐 Fuente Work Sans de Google Fonts
import { Work_Sans } from 'next/font/google'

import Loader from '@/components/shared/loader/loader'

import App from './app'

import type { Metadata } from 'next'

// 🎨 Importación de estilos globales y de terceros
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import '@/styles/globals.css'
import '@/styles/datatable.css'
import '@/styles/globalInputsReset.css'

// 🧠 Metadatos del sitio (ahora tipados con `Metadata` de Next.js)
export const metadata: Metadata = {
    title: 'IOTCorp SAS - Sistema de Competitividad y Desarrollo Tecnológico',
    description: 'Plataforma de gestión y desarrollo tecnológico de IOTCorp SAS',
}

// 🧩 Configuración de fuente
const FontWorkSans = Work_Sans({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

// 🧱 Definición de props del layout
interface RootLayoutProps {
  children: ReactNode
}

// 🚀 Componente principal del layout
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="es" className={FontWorkSans.className}>
            <head>
                <link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon.ico" />
            </head>
            <body>
                <App>
                    <Loader>{children}</Loader>
                </App>
            </body>
        </html>
    )
}
