import { useRouter } from 'next/navigation'
import { UserInfoForm } from './types'
import ProfileCardCentered from './ProfileCardCentered'
import styles from '../styles.module.css'

interface SecurityTabProps {
    userInfo: UserInfoForm
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
    handleLogout: () => void
    handleDeleteAccount: () => void
}

export default function SecurityTab({
    userInfo,
    getInitials,
    formatDate,
    handleLogout,
    handleDeleteAccount
}: SecurityTabProps) {
    const router = useRouter()

    const handleChangePassword = () => {
        router.push('/cambio_contrasena')
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Configuración de seguridad */}
            <div className={styles.infoPanel}>
                <h2 className={styles.sectionTitle}>Configuraciones de seguridad</h2>
                <p className={styles.sectionSubtitle}>
                    Estas configuraciones lo ayudan a mantener su cuenta segura.
                </p>

                <div className={styles.securitySection}>
                    {/* Cambiar contraseña */}
                    <div className={styles.securityItem}>
                        <div className={styles.securityItemContent}>
                            <h3 className={styles.securityItemTitle}>Cambiar la contraseña</h3>
                            <p className={styles.securityItemDescription}>
                                Establezca una contraseña única para proteger su cuenta.
                            </p>
                        </div>
                        <button 
                            className={styles.securityButton}
                            onClick={handleChangePassword}
                        >
                            Cambiar la contraseña
                        </button>
                    </div>

                    {/* Eliminar cuenta */}
                    <div className={styles.securityItem}>
                        <div className={styles.securityItemContent}>
                            <h3 className={styles.securityItemTitle}>Eliminar la cuenta</h3>
                            <p className={styles.securityItemDescription}>
                                Esta acción eliminará su usuario del sistema, junto a todos sus datos almacenados.
                            </p>
                        </div>
                        <button 
                            className={`${styles.securityButton} ${styles.securityButtonDanger}`}
                            onClick={handleDeleteAccount}
                        >
                            Eliminar la cuenta
                        </button>
                    </div>

                    {/* Cerrar sesión */}
                    <div className={styles.securityItem}>
                        <div className={styles.securityItemContent}>
                            <h3 className={styles.securityItemTitle}>Cerrar la sesión</h3>
                            <p className={styles.securityItemDescription}>
                                Esta acción cerrará la sesión del sistema.
                            </p>
                        </div>
                        <button 
                            className={`${styles.securityButton} ${styles.securityButtonSuccess}`}
                            onClick={handleLogout}
                        >
                            Salir del sistema
                        </button>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Card de perfil */}
            <ProfileCardCentered
                userInfo={userInfo}
                getInitials={getInitials}
                formatDate={formatDate}
            />
        </div>
    )
}
