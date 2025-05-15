import PropTypes from 'prop-types'
import ContentPage from './contentPage'
import stylesContentPage from './contentPage.module.css'

export const metadata = {
    title: 'Categorias de paneles',
    description: 'Categorias de paneles',
}

const CategoryPanelsPage = ({params}) => {
    return (
        <div className={stylesContentPage.content}>
            <ContentPage params={params} />
        </div>
    )
}

CategoryPanelsPage.propTypes = {
    params: PropTypes.object.isRequired
}

export default CategoryPanelsPage