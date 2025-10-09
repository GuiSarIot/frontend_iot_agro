import ContentPage from './contentPage'
import stylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Roles institucionales',
    description: 'Gestión de roles institucionales'
}

const ManageRolInPage: React.FC = () => {
    return (
        <div className={stylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default ManageRolInPage
