import PropTypes from 'prop-types'
import ContentApp from './contentApp'

export const metadata = {
    title: 'Reportes Sofia',
    description: 'Reportes Sofia',
}

const LayoutConsultantSofia = ({ children }) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

LayoutConsultantSofia.propTypes = {
    children: PropTypes.node
}

export default LayoutConsultantSofia