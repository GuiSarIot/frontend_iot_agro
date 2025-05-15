'use client'

import { useState } from 'react'
import PropTypes from 'prop-types'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import stylesSideBar from '../sideBarLeft.module.css'

const SubMenu = ({children, textButton, Icon}) => {

    //* states
    const [open, setOpen] = useState(false)

    //* styles
    const stylesButton = open ? `${stylesSideBar.active}` : ''
    const stylesSubMenuList = open ? `${stylesSideBar.subMenuList} ${stylesSideBar.active}` : `${stylesSideBar.subMenuList}`

    //* handlers
    const hanldeClick = () => {
        setOpen(!open)
    }

    //* rendes
    return (
        <>
            <button className={stylesButton} onClick={hanldeClick}>
                {Icon && <Icon />}
                {textButton}
                <span>
                    <ExpandMoreIcon />
                </span>
            </button>

            <ul className={stylesSubMenuList}>
                {children}
            </ul>
        </>
    )
}

SubMenu.propTypes = {
    children: PropTypes.node.isRequired,
    textButton: PropTypes.string.isRequired,
    Icon: PropTypes.elementType
}

export default SubMenu