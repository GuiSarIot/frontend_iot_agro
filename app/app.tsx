'use client'

import { ReactNode } from 'react'

import AppContext from '@/context/appContext'

interface AppProps {
  children: ReactNode
}

const App: React.FC<AppProps> = ({ children }) => {
    return <AppContext.Provider>{children}</AppContext.Provider>
}

export default App
