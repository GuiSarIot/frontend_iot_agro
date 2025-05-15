import PropTypes from 'prop-types'
import ContentApp from './contentApp'

//* metadata info
export const metadata = {
    title: 'Gestion de usuarios',
    description: 'Gestion de usuarios'
}

//* main module layout
const LayoutManageUser = ({children}) => {
    return (
        <div className="App">
            <ContentApp>
                {children}
            </ContentApp>
        </div>
    )
}

LayoutManageUser.propTypes = {
    children: PropTypes.node
}

export default LayoutManageUser