import { ReactNode, FC } from 'react'

import ContentApp from './contentApp'

//* metadata info
export const metadata = {
    title: 'Module title',
    description: 'Module description',
}

//* main module layout props
interface LayoutMainProps {
    children?: ReactNode
}

//* main module layout
const LayoutMain: FC<LayoutMainProps> = ({ children }) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

export default LayoutMain
