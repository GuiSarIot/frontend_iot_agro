'use client'

import { ReactNode } from 'react'

import AppLayout from '@/components/shared/layout/AppLayout'

// ---- Interfaces ----
interface LayoutCambioContrasenaProps {
    children: ReactNode
}

// * main module layout
const LayoutCambioContrasena: React.FC<LayoutCambioContrasenaProps> = ({ children }) => {
    return (
        <AppLayout showMainMenu={true}>
            {children}
        </AppLayout>
    )
}

export default LayoutCambioContrasena
