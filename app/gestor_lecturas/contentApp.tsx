'use client'

import { ReactNode } from 'react'

import AssessmentIcon from '@mui/icons-material/Assessment'
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
        label: 'Lecturas',
        href: '/gestor_lecturas',
        title: 'Lecturas'
    },
    {
        icon: <AssessmentIcon />,
        label: 'Estadísticas',
        href: '/gestor_lecturas/estadisticas',
        title: 'Estadísticas'
    }
]

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Gestión de lecturas" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp
