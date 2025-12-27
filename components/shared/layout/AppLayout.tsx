'use client'

import { ReactNode } from 'react'

import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import Content from '@/components/shared/content/content'
import NavBarTop from '@/components/shared/navBarTop/navBarTop'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import { useAppContext } from '@/context/appContext'

import SidebarMenu from './SidebarMenu'
import { getAvailableModules } from './modulesConfig.tsx'

// ---- Interfaces ----
interface AppLayoutProps {
    children: ReactNode
    sidebarContent?: ReactNode
    showSidebar?: boolean
    pageTitle?: string
    showMainMenu?: boolean  // Mostrar menú principal de módulos
}

// ---- Componente principal ----
const AppLayout: React.FC<AppLayoutProps> = ({ 
    children, 
    sidebarContent, 
    showSidebar = true,
    pageTitle,
    showMainMenu = false
}) => {
    // * context
    const { appState } = useAppContext()
    const title = pageTitle || appState.title
    const userPermissions = appState.userInfo.roles || []

    // Determinar el contenido del sidebar
    let finalSidebarContent = sidebarContent

    // Si se solicita el menú principal o no hay contenido específico, mostrar módulos disponibles
    if (showMainMenu || (!sidebarContent && showSidebar)) {
        const availableModules = getAvailableModules(userPermissions)
        finalSidebarContent = (
            <SidebarMenu 
                title="Módulos del Sistema" 
                items={availableModules} 
            />
        )
    }

    // * renders
    return (
        <ProtectedRoute>
            <>
                <div className="main">
                    {showSidebar && finalSidebarContent && (
                        <SideBarLeft>
                            {finalSidebarContent}
                        </SideBarLeft>
                    )}
                    <div className="container">
                        <NavBarTop />
                        <Content title={title}>
                            {children}
                        </Content>
                    </div>
                </div>
            </>
        </ProtectedRoute>
    )
}

export default AppLayout
