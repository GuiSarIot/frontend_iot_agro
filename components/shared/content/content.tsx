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
        <div className="container">
            {showTitle && title && (
                <div className={stylesContent.title}>
                    <h1>{title}</h1>
                </div>
            )}
            <div className="content">
                {children}
            </div>
        </div>
    )
}

export default Container
