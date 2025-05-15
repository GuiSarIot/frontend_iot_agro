import ContentPage from './contentPage.jsx'
import stylesPage from './contentPage.module.css'

export const metadata = {
    title: 'Reportes Sofia - etapa productiva',
    description: 'Reportes Sofia - etapa productiva'
}

const Page = () => {
    return (
        <div className={stylesPage.content}>
            <ContentPage />
        </div>
    )
}

export default Page
