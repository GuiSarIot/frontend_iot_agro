import { ReactNode } from 'react'
import ContentApp from './contentApp'

export default function GestorMqttLayout({
    children
}: {
    children: ReactNode
}) {
    return <ContentApp>{children}</ContentApp>
}
