'use client'

import { ReactNode } from 'react'

import LockIcon from '@mui/icons-material/Lock'
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
        label: 'Roles',
        href: '/gestor_usuarios/roles',
        title: 'Gestión de Roles'
    },  
    {
        icon: <LockIcon />,
        label: 'Permisos',
        href: '/gestor_usuarios/permisos',
        title: 'Gestión de Permisos'
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