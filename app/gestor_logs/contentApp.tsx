'use client'

import { ReactNode } from 'react'

import HistoryIcon from '@mui/icons-material/History'
import AssessmentIcon from '@mui/icons-material/Assessment'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Configuración del menú ----
const menuItems = [
    {
        icon: <HistoryIcon />,
        label: 'Logs de Auditoría',
        href: '/gestor_logs#audit',
        title: 'Ver logs de auditoría'
    },
    {
        icon: <AssessmentIcon />,
        label: 'Logs de Acceso',
        href: '/gestor_logs#access',
        title: 'Ver logs de acceso'
    }
]

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Auditoría y Logs" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp
