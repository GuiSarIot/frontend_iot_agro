'use client'

import { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import PropTypes from 'prop-types'
import '@/styles/globalsModalReset.css'
import stylesPage from './modalView.module.css'

const ModalView = ({
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
    const [visible, setVisible] = useState(isActive)

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
            <button onClick={(evt) => {
                evt.preventDefault()
                if (secondFuntionality) {
                    secondFuntionality()
                }
                setVisible(false)
                if (onClose) {
                    onClose()  
                }
            }}>
                {buttonText}
            </button>
        </div>
    )

    return (
        <div style={styleDivModal}>
            {isShowButtonActive && (
                <button 
                    className={stylesPage.buttonOutSide} 
                    onClick={(evt) => {
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
                    if (onClose) {
                        onClose()
                    }
                }}
            >
                {children}
                {textDescription !== '' && (<p> {textDescription}</p>)}
            </Dialog>
        </div>
    )
}

ModalView.propTypes = {
    children: PropTypes.node,
    secondFuntionality: PropTypes.func,
    textTitle: PropTypes.string.isRequired,
    textDescription: PropTypes.string,
    isActive: PropTypes.bool,
    isDraggable: PropTypes.bool,
    isResizable: PropTypes.bool,
    isShowButtonActive: PropTypes.bool,
    buttonOutSideText: PropTypes.string,
    buttonText: PropTypes.string,
    modalSize: PropTypes.string,
    onClose: PropTypes.func,
    styleDivModal: PropTypes.object
}

export default ModalView