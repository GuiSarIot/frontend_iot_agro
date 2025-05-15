'use client'

import { useReducer } from 'react'
import PropTypes from 'prop-types'
import React from 'react'

const AppContext = React.createContext()

const appReducer = (state, action) => {

    switch (action.type) {
    case 'CHANGE_TITLE':
        return {
            ...state,
            title: action.newTitle
        }

    case 'CHANGE_USER_INFO':
        return {
            ...state,
            userInfo: action.newUserInfo
        }

    case 'CHANGE_AUTH_CONTEXT':
        return {
            ...state,
            authContext: action.newAuthContext
        }

    case 'SHOW_NAVBAR':
        return {
            ...state,
            navBarState: action.isActive
        }
        
    case 'SHOW_LOADER':
        return {
            ...state,
            isLoading: action.isActive
        }
    }
}

const AppProvider = ({ children }) => {

    //* states
    const [appState, dispatch] = useReducer(appReducer, {
        title: '',
        navBarState: false,
        isLoading: true,
        userInfo: {
            name: '',
            email: '',
            role: '',
            module: null,
            id: null,
            roles: [],
            nameImage: '',
            hasRolIntitutional: false,
            nameRolIntitutional: '',
            levelAccessRolIntitutional: '',
        },
        authContext: {
            token: '',
            user: null,
            isLoggedIn: false,
            isLoading: false,
            isError: false,
        }
    })

    //* dispatchers
    const changeTitle = (newTitle) => dispatch({ type: 'CHANGE_TITLE', newTitle })
    const changeUserInfo = (newUserInfo) => dispatch({ type: 'CHANGE_USER_INFO', newUserInfo })
    const changeAuthContext = (newAuthContext) => dispatch({ type: 'CHANGE_AUTH_CONTEXT', newAuthContext })
    const showNavbar = (isActive) => dispatch({ type: 'SHOW_NAVBAR', isActive })
    const showLoader = (isActive) => dispatch({ type: 'SHOW_LOADER', isActive })

    //* renders
    return (
        <AppContext.Provider value={{
            appState,
            changeTitle,
            changeUserInfo,
            changeAuthContext,
            showNavbar,
            showLoader
        }}>
            {children}
        </AppContext.Provider>
    )
}

AppProvider.propTypes = {
    children: PropTypes.node.isRequired
}

const context = {
    Context: AppContext,
    Provider: AppProvider,
    Consumer: AppContext.Consumer
}

export default context