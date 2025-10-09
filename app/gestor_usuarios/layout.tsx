import { ReactNode } from 'react'

import ContentApp from './contentApp'

// * metadata info
export const metadata = {
    title: 'Gestion de usuarios',
    description: 'Gestion de usuarios'
}

// ---- Interfaces ----

interface LayoutManageUserProps {
    children: ReactNode
}

// * main module layout
const LayoutManageUser: React.FC<LayoutManageUserProps> = ({ children }) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

export default LayoutManageUser