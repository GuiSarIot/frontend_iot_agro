import { UserInfoForm } from './types'
import styles from './ProfileCardCentered.module.css'

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
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z"/>
                        </svg>
                    </button>
                    <button className={styles.actionButtonRound} title="Enviar mensaje">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                    </button>
                    <button className={styles.actionButtonRound} title="Comentar">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                        </svg>
                    </button>
                    <button className={styles.actionButtonRound} title="Editar">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
