import PropTypes from 'prop-types'
import ContentApp from './contentApp'

//* metadata info
export const metadata = {
    title: 'Prueba PDF',
    description: 'Prueba de PDF',
}


//* main module layout
const LayoutPruebaPdf = ({children}) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

LayoutPruebaPdf.propTypes = {
    children: PropTypes.node
}

export default LayoutPruebaPdf