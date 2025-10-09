'use client'

import React, { ReactNode } from 'react'

import stylesContent from './content.module.css'
import NavBarTop from '../navBarTop/navBarTop'

interface ContainerProps {
    children: ReactNode
    title: string
}

const Container: React.FC<ContainerProps> = ({ children, title }) => {
    return (
        <div className="main">
            <NavBarTop />
            <div className="container">
                <div className={stylesContent.title}>
                    <h1>{title}</h1>
                </div>
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Container
