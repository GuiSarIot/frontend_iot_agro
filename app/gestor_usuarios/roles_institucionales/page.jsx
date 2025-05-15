import StylesPage from './contentPage.module.css'
import ContentPage from './contentPage'

export const metadata = {
    title: 'Roles institucionales',
    description: 'Gestión de roles institucionales'
}

const ManageRolInPage = () => {
    return (
        <div className={StylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default ManageRolInPage