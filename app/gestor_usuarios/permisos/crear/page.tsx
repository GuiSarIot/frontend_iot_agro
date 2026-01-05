import ContentPage from './contentPage'
import StylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Permisos - crear',
    description: 'Creación de un nuevo permiso'
}

const CrearPermisoPage: React.FC = () => {
    return (
        <div className={StylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default CrearPermisoPage
