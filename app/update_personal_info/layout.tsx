import { ReactNode } from 'react'

import ContentApp from './contentApp'

//* metadata info
export const metadata = {
    title: 'Editar informacion personal',
    description: 'Editar informacion personal'
}

//* Props tipadas
interface LayoutMainProps {
    children?: ReactNode
}

//* main module layout
const LayoutMain: React.FC<LayoutMainProps> = ({ children }) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

export default LayoutMain
