'use client'

import { ReactNode } from 'react'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Configuración del menú ----
const menuItems = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
        ),
        label: 'Usuarios',
        href: '/gestor_usuarios',
        title: 'Usuarios'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
        ),
        label: 'Roles',
        href: '/gestor_usuarios/roles',
        title: 'Gestión de Roles'
    },  
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
        ),
        label: 'Permisos',
        href: '/gestor_usuarios/permisos',
        title: 'Gestión de Permisos'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
            </svg>
        ),
        label: 'Notificaciones Telegram',
        href: '/gestor_usuarios/telegram',
        title: 'Notificaciones de Telegram'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
        ),
        label: 'Notificaciones Email',
        href: '/gestor_usuarios/email',
        title: 'Notificaciones por Email'
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