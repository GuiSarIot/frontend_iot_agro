import { UserInfoForm } from './types'
import styles from '../styles.module.css'

interface ProfileCardProps {
    userInfo: UserInfoForm
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
    showAddButton?: boolean
}

export default function ProfileCard({ userInfo, getInitials, formatDate, showAddButton = false }: ProfileCardProps) {
    return (
        <div className={styles.profileCard}>
            <div className={styles.profileCardHeader}>
                <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                        {getInitials(userInfo.first_name, userInfo.last_name)}
                    </div>
                    {showAddButton && <button className={styles.addButton}>+</button>}
                </div>

                <div className={styles.roleBadge}>
                    {userInfo.rol_detail?.nombre?.toUpperCase() || 'SIN ROL'}
                </div>
            </div>

            <div className={styles.profileCardInfo}>
                <h3 className={styles.profileName}>
                    {userInfo.full_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Sin nombre'}
                </h3>

                <div className={styles.profileDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailValue}>{userInfo.email || 'Sin email'}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Username:</span>
                        <span className={styles.detailValue}>{userInfo.username || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Última conexión:</span>
                        <span className={styles.detailValue}>
                            {userInfo.last_login ? formatDate(userInfo.last_login) : 'Nunca'}
                        </span>
                    </div>
                </div>

                <div className={styles.profileActions}>
                    <button className={styles.actionButton} title="Desactivar notificaciones">
                        🔕
                    </button>
                    <button className={styles.actionButton} title="Enviar mensaje">
                        ✉️
                    </button>
                    <button className={styles.actionButton} title="Descargar información">
                        ☁️
                    </button>
                    <button className={styles.actionButton} title="Guardar">
                        🔖
                    </button>
                </div>
            </div>
        </div>
    )
}
