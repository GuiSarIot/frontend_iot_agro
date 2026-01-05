'use client'

import { ReactNode, useEffect } from 'react'

import { PrimeReactProvider } from 'primereact/api'

import AppContext, { useAppContext } from '@/context/appContext'

interface AppProps {
  children: ReactNode
}

const ThemeApplier: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { appState } = useAppContext()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', appState.theme)
    }, [appState.theme])

    return <>{children}</>
}

const App: React.FC<AppProps> = ({ children }) => {
    return (
        <PrimeReactProvider>
            <AppContext.Provider>
                <ThemeApplier>{children}</ThemeApplier>
            </AppContext.Provider>
        </PrimeReactProvider>
    )
}

export default App
