'use client'

import { ReactNode, FC, MouseEvent, useContext } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import SaveRoute from '@/components/protectedRoute/saveRoute'
import Content from '@/components/shared/content/content'
import SideBarLeft from '@/components/shared/sideBarLeft/sideBarLeft'
import stylesSideBar from '@/components/shared/sideBarLeft/sideBarLeft.module.css'
import AppContext from '@/context/appContext'

interface ContentAppProps {
    children?: ReactNode
}

const ContentApp: FC<ContentAppProps> = ({ children }) => {
    const { appState, changeTitle } = useContext(AppContext.Context)
    const router = useRouter()

    const handleLink = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        const target = event.currentTarget
        const href = target.getAttribute('href') || ''
        const title = target.innerText

        SaveRoute({ 
            routeInfo: href,
            title
        })
        changeTitle(title)
        router.push(href)
    }

    return (
        <>
            {/* Module menu list */}
            <SideBarLeft>
                <li className={stylesSideBar.title}><h3>Tile section Menu</h3></li>
                <li className={stylesSideBar.item}>
                    <Link onClick={handleLink} href="template_example/path">Option 1</Link>
                </li>
                <li className={stylesSideBar.item}>
                    <Link onClick={handleLink} href="template_example/path">Option 2</Link>
                </li>
            </SideBarLeft>

            {/* Module content */}
            <Content title={appState.title}>
                {children}
            </Content>
        </>
    )
}

export default ContentApp
