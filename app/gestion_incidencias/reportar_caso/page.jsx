import stylesPage from './crearPage.module.css'
import ContentPageCreate from './contentPageCreateIncidencia'

export const metadata = {
    title: 'Gestion de incidencias - crear incidencia',
    description: 'Gestion de incidencias - crear incidencia'
}

const ManageCreateIncidenciaPage = async () => {
    return (
        <div className={stylesPage.content}>
            <ContentPageCreate />
        </div>
    )
}

export default ManageCreateIncidenciaPage