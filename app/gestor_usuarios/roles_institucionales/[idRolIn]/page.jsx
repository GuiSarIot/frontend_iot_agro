import PropTypes from 'prop-types'
import ContentPage from './contentPage'
import StylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Roles institucionales - editar',
    description: 'Edición de un rol institucional'
}

const UpdateRolInstitucionalPage = ({ params }) => {
    return (
        <div className={StylesPage.content}>
            <ContentPage rolId={params} />
        </div>
    )
}

UpdateRolInstitucionalPage.propTypes = {
    params: PropTypes.object
}

export default UpdateRolInstitucionalPage