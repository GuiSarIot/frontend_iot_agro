'use client'

import { ReactNode } from 'react'

import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SecurityIcon from '@mui/icons-material/Security'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Configuración del menú ----
const menuItems = [
    {
        icon: <PeopleIcon />,
        label: 'Listado de usuarios',
        href: '/gestor_usuarios',
        title: 'Listado de usuarios'
    },
    {
        icon: <PersonAddIcon />,
        label: 'Nuevo Usuario',
        href: '/gestor_usuarios/crear',
        title: 'Nuevo Usuario'
    },
    {
        icon: <SecurityIcon />,
        label: 'Roles Institucionales',
        href: '/gestor_usuarios/roles_institucionales',
        title: 'Gestión de Roles'
    }
]

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Gestión de usuarios" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp