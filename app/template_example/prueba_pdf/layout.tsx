import { ReactNode, FC } from 'react'

import ContentApp from './contentApp'

//* metadata info
export const metadata = {
    title: 'Prueba PDF',
    description: 'Prueba de PDF',
}

//* props interface
interface LayoutPruebaPdfProps {
    children?: ReactNode
}

//* main module layout
const LayoutPruebaPdf: FC<LayoutPruebaPdfProps> = ({ children }) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

export default LayoutPruebaPdf
