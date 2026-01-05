import ContentPage from './contentPage'
import stylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Roles - crear',
    description: 'Creación de roles'
}

const CreateRolePage: React.FC = () => {
    return (
        <div className={stylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default CreateRolePage
