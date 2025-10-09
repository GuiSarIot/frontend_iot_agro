'use client'

import React, { useState, useEffect, ReactNode, CSSProperties, MouseEvent } from 'react'

import { Dialog } from 'primereact/dialog'

import stylesPage from './modalView.module.css'
import '@/styles/globalsModalReset.css'

interface ModalViewProps {
    children?: ReactNode
    secondFuntionality?: () => void
    textTitle: string
    textDescription?: string
    isActive?: boolean
    isDraggable?: boolean
    isResizable?: boolean
    isShowButtonActive?: boolean
    buttonOutSideText?: string
    buttonText?: string
    modalSize?: string
    onClose?: () => void
    styleDivModal?: CSSProperties
}

const ModalView: React.FC<ModalViewProps> = ({
    children,
    secondFuntionality,
    textTitle,
    textDescription = '',
    isActive = false,
    isDraggable = false,
    isResizable = false,
    isShowButtonActive = true,
    buttonOutSideText = 'Abrir',
    buttonText = 'Continuar',
    modalSize = '50vw',
    onClose,
    styleDivModal = {}
}) => {
    const [visible, setVisible] = useState<boolean>(isActive)

    useEffect(() => {
        setVisible(isActive)
    }, [isActive])

    const headerElement = (
        <div className={stylesPage.titleModal}>
            <h3>{textTitle}</h3>
        </div>
    )

    const footerContent = (
        <div className={stylesPage.btnFooter}>
            <button
                onClick={(evt: MouseEvent<HTMLButtonElement>) => {
                    evt.preventDefault()
                    if (secondFuntionality) secondFuntionality()
                    setVisible(false)
                    if (onClose) onClose()
                }}
            >
                {buttonText}
            </button>
        </div>
    )

    return (
        <div style={styleDivModal}>
            {isShowButtonActive && (
                <button
                    className={stylesPage.buttonOutSide}
                    onClick={(evt: MouseEvent<HTMLButtonElement>) => {
                        evt.preventDefault()
                        setVisible(true)
                    }}
                >
                    {buttonOutSideText}
                </button>
            )}
            <Dialog
                visible={visible}
                modal
                header={headerElement}
                draggable={isDraggable}
                resizable={isResizable}
                footer={footerContent}
                style={{ width: modalSize }}
                onHide={() => {
                    setVisible(false)
                    if (onClose) onClose()
                }}
            >
                {children}
                {textDescription && <p>{textDescription}</p>}
            </Dialog>
        </div>
    )
}

export default ModalView
