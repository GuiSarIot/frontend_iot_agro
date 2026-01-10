'use client'

import { ReactNode } from 'react'

import ListIcon from '@mui/icons-material/List'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Configuración del menú ----
const menuItems = [
    {
        icon: <ListIcon />,
        label: 'Sensores',
        href: '/gestor_sensores',
        title: 'Sensores'
    }
]

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Gestión de sensores" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp
