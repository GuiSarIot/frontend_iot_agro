import ContentPage from './contentPage'
import stylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Roles',
    description: 'Gestión de roles'
}

const ManageRolesPage: React.FC = () => {
    return (
        <div className={stylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default ManageRolesPage
