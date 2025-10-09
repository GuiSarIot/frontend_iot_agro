import ContentPageCreate from './contentPageCreate'
import stylesPage from './crearPage.module.css'

export const metadata = {
    title: 'Gestión de usuarios - crear',
    description: 'Gestión de usuarios - crear',
}

const ManageUsersCreatePage: React.FC = async () => {
    return (
        <div className={stylesPage.content}>
            <ContentPageCreate />
        </div>
    )
}

export default ManageUsersCreatePage
