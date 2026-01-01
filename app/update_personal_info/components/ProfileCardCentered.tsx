import { UserInfoForm } from './types'
import styles from '../styles.module.css'

interface ProfileCardCenteredProps {
    userInfo: UserInfoForm
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
}

export default function ProfileCardCentered({ userInfo, getInitials, formatDate }: ProfileCardCenteredProps) {
    return (
        <div className={`${styles.profileCard} ${styles.profileCardNotifications}`}>
            <div className={styles.profileCardHeaderCentered}>
                <div className={styles.avatarContainerCentered}>
                    <div className={styles.avatarLarge}>
                        {getInitials(userInfo.first_name, userInfo.last_name)}
                    </div>
                </div>
                <div className={styles.roleBadgeCentered}>
                    {userInfo.rol_detail?.nombre?.toUpperCase() || 'SUPERUSUARIO'}
                </div>
            </div>

            <div className={styles.profileCardInfoCentered}>
                <h3 className={styles.profileNameLarge}>
                    {userInfo.full_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Super Admin 2'}
                </h3>

                <div className={styles.profileDetailsCentered}>
                    <div className={styles.emailPrimary}>
                        {userInfo.email || 'guillonix@gmail.com'}
                    </div>
                    <div className={styles.detailRowCentered}>
                        <span className={styles.detailLabelCentered}>Username:</span>
                        <span className={styles.detailValueCentered}>{userInfo.username || 'admin'}</span>
                    </div>
                    <div className={styles.detailRowCentered}>
                        <span className={styles.detailLabelCentered}>Última conexión:</span>
                        <span className={styles.detailValueCentered}>
                            {userInfo.last_login ? formatDate(userInfo.last_login) : '01/01/2026, 11:56:15 a. m.'}
                        </span>
                    </div>
                </div>

                <div className={styles.profileActionsCentered}>
                    <button className={styles.actionButtonRound} title="Desactivar notificaciones">
                        🔕
                    </button>
                    <button className={styles.actionButtonRound} title="Enviar mensaje">
                        💬
                    </button>
                    <button className={styles.actionButtonRound} title="Comentar">
                        💬
                    </button>
                    <button className={styles.actionButtonRound} title="Editar">
                        📌
                    </button>
                </div>
            </div>
        </div>
    )
}
