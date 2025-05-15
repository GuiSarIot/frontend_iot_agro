import PropTypes from 'prop-types'
import ContentApp from './contentApp'

export const metadata = {
    title: 'Pruebas',
    description: 'Modulo de prueba',
}

const SupportPage = ({ children }) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

SupportPage.propTypes = {
    children: PropTypes.node
}

export default SupportPage