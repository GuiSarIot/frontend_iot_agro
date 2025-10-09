import { FC, ReactNode } from 'react'

export const metadata = {
    title: 'Recuperar Contraseña| login',
    description: 'Página de recuperación de contraseña'
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
