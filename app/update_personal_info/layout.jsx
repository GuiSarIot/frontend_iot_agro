import PropTypes from 'prop-types'
import ContentApp from './contentApp'

//* metadata info
export const metadata = {
    title: 'Editar informacion personal',
    description: 'Editar informacion personal'
}

//* main module layout
const LayoutMain = ({children}) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

LayoutMain.propTypes = {
    children: PropTypes.node
}

export default LayoutMain