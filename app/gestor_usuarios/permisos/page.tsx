import ContentPage from './contentPage'
import StylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Permisos',
    description: 'Gestión de permisos del sistema'
}

const PermisosPage: React.FC = () => {
    return (
        <div className={StylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default PermisosPage
