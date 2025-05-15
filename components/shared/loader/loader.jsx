'use client'

import { useContext } from 'react'
import PropTypes from 'prop-types'
import AppContext from '@/context/appContext'
import StylesLoaders from './loader.module.css'

const Loader = ({ children }) => {

    //* context
    const {appState} = useContext(AppContext.Context)
    const {isLoading} = appState

    return (
        <>
            <div className={StylesLoaders.page}>
                {isLoading && (
                    <div className={StylesLoaders.pageLoader}>
                        <div className={StylesLoaders.container}>
                            <div className={StylesLoaders.ring}></div>
                            <div className={StylesLoaders.ring}></div>
                            <div className={StylesLoaders.ring}></div>
                            <div className={StylesLoaders.ring}></div>
                            <div className={StylesLoaders.h2}>Cargando...</div>
                        </div>
                    </div>
                )}

                {children}
            </div>
        </>
    )
}

Loader.propTypes = {
    children: PropTypes.node.isRequired
}

export default Loader
