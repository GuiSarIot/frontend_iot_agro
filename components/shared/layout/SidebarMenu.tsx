'use client'

import { ReactNode, MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'

// ---- Interfaces ----
export interface SidebarMenuItem {
    icon?: ReactNode
    label: string
    href: string
    title?: string
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

interface SidebarMenuProps {
    title: string
    items: SidebarMenuItem[]
}

// ---- Componente SidebarMenu ----
const SidebarMenu: React.FC<SidebarMenuProps> = ({ title, items }) => {
    const pathname = usePathname()
    
    const handleClick = (e: MouseEvent<HTMLAnchorElement>, item: SidebarMenuItem) => {
        console.log('SidebarMenu - Click detectado:', item.label, item.href)
        // Si hay un onClick personalizado, llamarlo pero no prevenir la navegación
        if (item.onClick) {
            item.onClick(e)
        }
    }
    
    const isActive = (href: string) => {
        // Coincidencia exacta
        if (pathname === href) {
            return true
        }
        
        // Para subrutas, verificar que la ruta actual comience con el href
        // pero solo si no coincide exactamente con ninguna otra ruta del menú
        if (pathname?.startsWith(href + '/')) {
            // Verificar que ninguna otra ruta del menú sea una coincidencia más específica
            const hasMoreSpecificMatch = items.some(item => 
                item.href !== href && 
                item.href.length > href.length && 
                (pathname === item.href || pathname?.startsWith(item.href + '/'))
            )
            
            return !hasMoreSpecificMatch
        }
        
        return false
    }

    return (
        <>
            <li className={stylesSideBar.title}>
                <h3>{title}</h3>
            </li>
            {items.map((item, index) => (
                <li key={index} className={stylesSideBar.item}>
                    <Link 
                        href={item.href} 
                        title={item.title || item.label}
                        onClick={(e) => handleClick(e, item)}
                        className={isActive(item.href) ? stylesSideBar.active : ''}
                    >
                        {item.icon && item.icon}
                        <span>{item.label}</span>
                    </Link>
                </li>
            ))}
        </>
    )
}

export default SidebarMenu
