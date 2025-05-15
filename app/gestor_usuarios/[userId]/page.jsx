import PropTypes from 'prop-types'
import stylesPage from './stylesPage.module.css'
import ContentPageUpdate from './contentPageUpdate.jsx'

export const metadata = {
    title: 'Gestor de usuarios - editar',
    description: 'Gestor de usuarios - editar',
}

const ManageUsersUpdatePage = ({ params }) => {

    return (
        <div className={stylesPage.content}>
            <ContentPageUpdate userUrl={params} />
        </div>
    )
}

ManageUsersUpdatePage.propTypes = {
    params: PropTypes.object
}

export default ManageUsersUpdatePage


