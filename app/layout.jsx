
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import { Work_Sans } from 'next/font/google'
import Loader from '@/components/shared/loader/loader'
import PropTypes from 'prop-types'
import '@/styles/globals.css'
import '@/styles/datatable.css'
import '@/styles/globalInputsReset.css'
import App from './app'

export const metadata = {
    title: 'SENAVANCE ',
    description: 'Sistema de Competitividad y Desarrollo Tecnológico - SENA',
}

const FontWorkSans = Work_Sans({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

export default function RootLayout({ children }) {
    return (
        <html lang="es" className={FontWorkSans.className}>
            <head>
                <link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon.ico" />
            </head>
            <body>
                <App>
                    <Loader>
                        {children}
                    </Loader>
                </App>
            </body>
        </html>
    )
}

RootLayout.propTypes = {
    children: PropTypes.node.isRequired
}
