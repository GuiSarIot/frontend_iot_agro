'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import PropTypes from 'prop-types'
import Link from 'next/link'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import Content from '@/components/shared/content/content'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import AppContext from '@/context/appContext'
import SaveRoute from '@/components/protectedRoute/saveRoute'

const ContentApp = ({ children }) => {

    //* context 
    const { appState, changeTitle } = useContext(AppContext.Context)

    //* hooks
    const router = useRouter()

    //* Links handlers
    const handleLink = (event) => {
        event.preventDefault()
        SaveRoute({ 
            routeInfo: event.target.getAttribute('href'),
            title: event.target.innerText
        })
        changeTitle(event.target.innerText)
        router.push(event.target.getAttribute('href'))
    }

    //* renders
    return (
        <>
            {/* your module menu list */}
            <SideBarLeft>
                <li className={stylesSideBar.title}><h3>Tile section Menu</h3></li>
                <li className={stylesSideBar.item}><Link onClick={handleLink} href="template_example/path">Option 1</Link></li>
                <li className={stylesSideBar.item}><Link onClick={handleLink} href="template_example/path">Option 2</Link></li>
            </SideBarLeft>

            {/* content of your Module */}
            <Content title={appState.title}>
                {children}
            </Content>
        </>
    )
}

ContentApp.propTypes = {
    children: PropTypes.node
}

export default ContentApp