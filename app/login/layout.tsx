'use client'

import { FC, ReactNode } from 'react'

export const metadata = {
    title: 'Inicio de sesión | login',
    description: 'Login'
}

interface LoginLayoutProps {
    children: ReactNode
}

const LoginLayout: FC<LoginLayoutProps> = ({ children }) => {
    return (
        <main className="App">
            {children}
        </main>
    )
}

export default LoginLayout
