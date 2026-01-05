import ContentPage from './contentPage'
import StylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Permisos - editar',
    description: 'Edición de un permiso'
}

// Definimos la interfaz para las props
interface UpdatePermisoPageProps {
    params: {
        [key: string]: string
    }
}

const UpdatePermisoPage: React.FC<UpdatePermisoPageProps> = ({ params }) => {
    return (
        <div className={StylesPage.content}>
            <ContentPage permisoId={{ idPermiso: params.idPermiso }} />
        </div>
    )
}

export default UpdatePermisoPage
