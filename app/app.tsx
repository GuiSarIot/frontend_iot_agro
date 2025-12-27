'use client'

import { ReactNode, useEffect } from 'react'

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
        <AppContext.Provider>
            <ThemeApplier>{children}</ThemeApplier>
        </AppContext.Provider>
    )
}

export default App
