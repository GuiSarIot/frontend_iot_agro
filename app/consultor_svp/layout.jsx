import PropTypes from 'prop-types'
import ContentApp from './contentApp'

export const metadata = {
    title: 'Consultor - SVP',
    description: 'Consultor - SVP',
}

const LayoutConsultantSVP = ({children}) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

LayoutConsultantSVP.propTypes = {
    children: PropTypes.node.isRequired
}

export default LayoutConsultantSVP