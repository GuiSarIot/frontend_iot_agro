import ProfileCard from './ProfileCard'
import { UserInfoForm } from './types'
import styles from '../styles.module.css'

interface PersonalInfoTabProps {
    userInfo: UserInfoForm
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
}

export default function PersonalInfoTab({ userInfo, getInitials, formatDate }: PersonalInfoTabProps) {
    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Información */}
            <div className={styles.infoPanel}>
                <div className={styles.infoSection}>
                    <h2 className={styles.sectionTitle}>Información Personal</h2>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Información basica del usuario
                    </p>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Estado:</span>
                            <span className={`${styles.statusBadge} ${userInfo.is_active ? styles.active : ''}`}>
                                {userInfo.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Nombre Completo:</span>
                            <span className={styles.fieldValue}>
                                {userInfo.full_name || 'N/A'}
                            </span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Nombre de usuario:</span>
                            <span className={styles.fieldValue}>{userInfo.username || 'N/A'}</span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Correo electrónico:</span>
                            <span className={styles.fieldValue}>{userInfo.email || 'N/A'}</span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Telefono:</span>
                            <span className={styles.fieldValue}>{userInfo.telefono || 'N/A'}</span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Última conexión:</span>
                            <span className={styles.fieldValue}>
                                {userInfo.last_login ? formatDate(userInfo.last_login) : 'Nunca'}
                            </span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Telegram username:</span>
                            <span className={styles.fieldValue}>{userInfo.telegram_username || 'N/A'}</span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Registrado:</span>
                            <span className={styles.fieldValue}>
                                {formatDate(userInfo.created_at)}
                            </span>
                        </div>

                        <div className={styles.infoField}>
                            <span className={styles.fieldLabel}>Tipo de usuario:</span>
                            <span className={styles.fieldValue}>
                                {userInfo.tipo_usuario_display || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Card de perfil */}
            <ProfileCard 
                userInfo={userInfo}
                getInitials={getInitials}
                formatDate={formatDate}
                showAddButton={true}
            />
        </div>
    )
}
