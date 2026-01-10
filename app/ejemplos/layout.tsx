'use client'

import { ReactNode } from 'react'

import DevicesIcon from '@mui/icons-material/Devices'
import HomeIcon from '@mui/icons-material/Home'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface LayoutEjemplosProps {
    children: ReactNode
}

// ---- Configuración del menú ----
const menuItems = [
    {
        icon: <HomeIcon />,
        label: 'Módulos del Sistema',
        href: '/dashboard',
        title: 'Volver al menú principal'
    },
    {
        icon: <DevicesIcon />,
        label: 'Ejemplo Dispositivos',
        href: '/ejemplos/gestor_dispositivos-example',
        title: 'Ejemplo de gestión de dispositivos'
    }
]

// * main module layout
const LayoutEjemplos: React.FC<LayoutEjemplosProps> = ({ children }) => {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Ejemplos" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default LayoutEjemplos
