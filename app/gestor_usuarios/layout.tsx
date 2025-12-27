import { ReactNode } from 'react'

import ContentApp from './contentApp'

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