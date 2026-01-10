'use client'

import { ReactNode } from 'react'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'
import { MODULE_MENUS } from '@/components/shared/layout/moduleMenuConfig'

// ---- Interfaces ----
interface ContentAppProps {
    children: ReactNode
}

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    const menuItems = MODULE_MENUS['/gestor_mqtt'] || []

    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Gestión de MQTT" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp
