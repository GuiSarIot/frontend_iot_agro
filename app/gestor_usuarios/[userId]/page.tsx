import ContentPageUpdate from './contentPageUpdate'
import stylesPage from './stylesPage.module.css'


export const metadata = {
    title: 'Gestor de usuarios - editar',
    description: 'Gestor de usuarios - editar',
}

interface ManageUsersUpdatePageProps {
    params: {
        userId: string | number
    }
}

const ManageUsersUpdatePage: React.FC<ManageUsersUpdatePageProps> = ({ params }) => {
    return (
        <div className={stylesPage.content}>
            <ContentPageUpdate userUrl={params} />
        </div>
    )
}

export default ManageUsersUpdatePage
