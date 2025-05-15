import stylesPage from './contentPage.module.css'
import ContentPage from './contentPage'

export const metada = {
    title: 'Roles institucionales - crear',
    description: 'Creación de roles institucionales'
}

const CreateRolInstitucionalPage = () => {
    return (
        <div className={stylesPage.content}>
            <ContentPage />
        </div>
    )    
}


export default CreateRolInstitucionalPage