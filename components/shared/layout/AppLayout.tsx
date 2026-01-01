'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import ProtectedRoute from '@/components/protectedRoute/protectedRoute'
import Content from '@/components/shared/content/content'
import NavBarTop from '@/components/shared/navBarTop/navBarTop'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import { useAppContext } from '@/context/appContext'

import { getAvailableModules, MODULES_CONFIG } from './modulesConfig.tsx'
import { getModuleMenuByPath } from './moduleMenuConfig.tsx'
import SidebarMenu from './SidebarMenu'
import styles from './AppLayout.module.css'

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
    const { sidebarCollapsed } = appState
    
    // Obtener la ruta actual
    const pathname = usePathname()

    // Función para obtener el título del módulo activo
    const getActiveModuleTitle = () => {
        if (!pathname) return 'Menú'
        
        // Buscar el módulo que coincida con la ruta actual
        const moduleEntry = Object.entries(MODULES_CONFIG).find(([_, config]) => 
            pathname === config.href || pathname.startsWith(config.href + '/')
        )
        
        return moduleEntry ? moduleEntry[1].label : 'Menú'
    }

    // Determinar el contenido del sidebar
    let finalSidebarContent = sidebarContent

    // Si no hay contenido personalizado del sidebar
    if (!sidebarContent && showSidebar) {
        // Si se solicita el menú principal o no hay menú de módulo disponible
        if (showMainMenu) {
            const availableModules = getAvailableModules(userPermissions)
            finalSidebarContent = (
                <SidebarMenu 
                    title={getActiveModuleTitle()}
                    items={availableModules} 
                />
            )
        } else {
            // Intentar obtener el menú del módulo actual basado en la ruta
            const moduleMenu = getModuleMenuByPath(pathname || '')
            
            if (moduleMenu) {
                finalSidebarContent = (
                    <SidebarMenu 
                        title={getActiveModuleTitle()}
                        items={moduleMenu} 
                    />
                )
            } else {
                // Mostrar módulos principales como fallback
                const availableModules = getAvailableModules(userPermissions)
                finalSidebarContent = (
                    <SidebarMenu 
                        title={getActiveModuleTitle()}
                        items={availableModules} 
                    />
                )
            }
        }
    }

    // Clases dinámicas
    const containerClass = sidebarCollapsed ? `${styles.container} ${styles.containerCollapsed}` : styles.container

    // * renders
    return (
        <ProtectedRoute>
            <>
                <div className={styles.main}>
                    {showSidebar && finalSidebarContent && (
                        <SideBarLeft>
                            {finalSidebarContent}
                        </SideBarLeft>
                    )}
                    <div className={containerClass}>
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
