'use client'

import { ReactNode } from 'react'

import AppLayout from '@/components/shared/layout/AppLayout'

//* Props tipadas
interface LayoutMainProps {
    children?: ReactNode
}

//* main module layout
const LayoutMain: React.FC<LayoutMainProps> = ({ children }) => {
    return (
        <AppLayout showMainMenu={true}>
            {children}
        </AppLayout>
    )
}

export default LayoutMain
