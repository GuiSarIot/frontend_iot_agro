'use client'

import { ReactNode, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'

import AppLayout from '@/components/shared/layout/AppLayout'
import SidebarMenu from '@/components/shared/layout/SidebarMenu'

// ---- Interfaces ----
interface ContentAppProps {
    children?: ReactNode
}

// ---- Componente principal ----
const ContentApp: React.FC<ContentAppProps> = ({ children }) => {
    //* hooks
    const router = useRouter()

    //* handlers
    const handleBack = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        router.back()
    }

    // Configuración del menú
    const menuItems = [
        {
            label: 'Volver',
            href: '/',
            onClick: handleBack
        }
    ]

    //* renders
    return (
        <AppLayout 
            sidebarContent={<SidebarMenu title="Edición información personal" items={menuItems} />}
        >
            {children}
        </AppLayout>
    )
}

export default ContentApp
