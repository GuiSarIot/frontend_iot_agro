import stylesPage from './crearPage.module.css'
import ContentPageCreate from './contentPageCreate'

export const metadata = {
    title: 'Gestion de usuarios - crear',
    description: 'Gestion de usuarios - crear'
}

const ManageUsersCreatePage = async () => {
    return (
        <div className={stylesPage.content}>
            <ContentPageCreate />
        </div>
    )
}

export default ManageUsersCreatePage