import ContentPage from './contentPage'
import stylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Roles institucionales - crear',
    description: 'Creación de roles institucionales'
}

const CreateRolInstitucionalPage: React.FC = () => {
    return (
        <div className={stylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default CreateRolInstitucionalPage
