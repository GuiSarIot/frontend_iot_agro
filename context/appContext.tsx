'use client'

import React, { useReducer, ReactNode, useCallback } from 'react'

import { initialState } from './appInitialState'
import { appReducer } from './appReducer'
import { AppContextValue, AuthContextState, UserInfo } from './types/app.types'

// eslint-disable-next-line import/no-named-as-default-member
const AppContext = React.createContext<AppContextValue | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [appState, dispatch] = useReducer(appReducer, initialState)

    const changeTitle = useCallback((newTitle: string) => dispatch({ type: 'CHANGE_TITLE', newTitle }), [])
    const changeUserInfo = useCallback((newUserInfo: Partial<UserInfo> | UserInfo) =>
        dispatch({ type: 'CHANGE_USER_INFO', newUserInfo }), [])
    const changeAuthContext = useCallback((newAuthContext: Partial<AuthContextState> | AuthContextState) =>
        dispatch({ type: 'CHANGE_AUTH_CONTEXT', newAuthContext }), [])
    const showNavbar = useCallback((isActive: boolean) => dispatch({ type: 'SHOW_NAVBAR', isActive }), [])
    const toggleSidebarCollapse = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSE' }), [])
    const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), [])
    const showLoader = useCallback((isActive: boolean) => dispatch({ type: 'SHOW_LOADER', isActive }), [])

    return (
        <AppContext.Provider
            value={{ appState, changeTitle, changeUserInfo, changeAuthContext, showNavbar, toggleSidebarCollapse, toggleTheme, showLoader, dispatch }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = (): AppContextValue => {
    // eslint-disable-next-line import/no-named-as-default-member
    const ctx = React.useContext(AppContext)
    if (!ctx) throw new Error('useAppContext debe usarse dentro de <AppProvider>')
    return ctx
}

// Export con el patrón que usabas
const context = {
    Context: AppContext,
    Provider: AppProvider,
    Consumer: AppContext.Consumer,
}

export default context