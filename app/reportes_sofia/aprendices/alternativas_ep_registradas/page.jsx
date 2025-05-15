import ContentPage from './contentPage'
import stylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Alternativas EP Registradas',
    description: 'Reporte de alternativas EP registradas',
}

const AlternativeEPRegistered = () => {
    return (
        <div className={stylesPage.ContentPage}>
            <ContentPage />
        </div>
    )
}

export default AlternativeEPRegistered