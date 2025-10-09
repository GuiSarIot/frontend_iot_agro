'use client'

import { useState, ReactNode, ElementType } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import stylesSideBar from '../sideBarLeft.module.css'

interface SubMenuProps {
    children: ReactNode
    textButton: string
    Icon?: ElementType
}

const SubMenu: React.FC<SubMenuProps> = ({ children, textButton, Icon }) => {
    // States
    const [open, setOpen] = useState(false)

    // Styles
    const stylesButton = open ? `${stylesSideBar.active}` : ''
    const stylesSubMenuList = open
        ? `${stylesSideBar.subMenuList} ${stylesSideBar.active}`
        : `${stylesSideBar.subMenuList}`

    // Handlers
    const handleClick = () => {
        setOpen(!open)
    }

    // Render
    return (
        <>
            <button className={stylesButton} onClick={handleClick}>
                {Icon && <Icon />}
                {textButton}
                <span>
                    <ExpandMoreIcon />
                </span>
            </button>

            <ul className={stylesSubMenuList}>{children}</ul>
        </>
    )
}

export default SubMenu
