import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Simuladores MQTT | IoT Platform',
    description: 'Panel de control para simuladores MQTT - Control de dispositivos IoT en tiempo real',
}

export default function TestMqttSimulatorsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
