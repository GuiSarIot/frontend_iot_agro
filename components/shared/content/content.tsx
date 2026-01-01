'use client'

import React, { ReactNode } from 'react'

import stylesContent from './content.module.css'

interface ContainerProps {
    children: ReactNode
    title?: string
    showTitle?: boolean
}

const Container: React.FC<ContainerProps> = ({ children, title, showTitle = false }) => {
    return (
        <div className={stylesContent.content}>
            <div className={stylesContent.contentInner}>
                {showTitle && title && (
                    <div className={stylesContent.title}>
                        <h1>{title}</h1>
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}

export default Container
