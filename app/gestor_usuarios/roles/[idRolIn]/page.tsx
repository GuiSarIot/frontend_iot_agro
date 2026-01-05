import ContentPage from './contentPage'
import StylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Roles - editar',
    description: 'Edición de un rol'
}

// Definimos la interfaz para las props
interface UpdateRolInstitucionalPageProps {
    params: {
        [key: string]: string
    }
}

const UpdateRolInstitucionalPage: React.FC<UpdateRolInstitucionalPageProps> = ({ params }) => {
    return (
        <div className={StylesPage.content}>
            <ContentPage rolId={{ idRolIn: params.idRolIn }} />
        </div>
    )
}

export default UpdateRolInstitucionalPage
