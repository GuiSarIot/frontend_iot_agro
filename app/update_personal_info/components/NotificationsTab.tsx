import React from 'react'

import ProfileCardCentered from './ProfileCardCentered'
import { UserInfoForm, NotificationSettings } from './types'
import styles from '../styles.module.css'

interface NotificationsTabProps {
    userInfo: UserInfoForm
    notificationSettings: NotificationSettings
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
    handleNotificationToggle: (type: 'email' | 'telegram') => void
    handleTelegramIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSaveNotifications: () => void
}

export default function NotificationsTab({
    userInfo,
    notificationSettings,
    getInitials,
    formatDate,
    handleNotificationToggle,
    handleTelegramIdChange,
    handleSaveNotifications
}: NotificationsTabProps) {
    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Configuración */}
            <div className={styles.infoPanel}>
                <h2 className={styles.sectionTitle}>Configuración de las notificaciones</h2>
                <p className={styles.sectionSubtitle}>Notificaciones mediante correo electrónico y Telegram</p>

                <div className={styles.notificationsSection}>
                    <h3 className={styles.notificationTitle}>Habilitar/Deshabilitar las alertas de dispositivos</h3>
                    
                    {/* Toggle Email */}
                    <div className={styles.toggleGroup}>
                        <label className={styles.toggleLabel}>
                            <div className={styles.toggleWrapper}>
                                <input
                                    type="checkbox"
                                    className={styles.toggleInput}
                                    checked={notificationSettings.email_notifications}
                                    onChange={() => handleNotificationToggle('email')}
                                />
                                <span className={styles.toggleSlider}></span>
                            </div>
                            <span className={styles.toggleText}>Recibe alertas en el correo electrónico</span>
                        </label>
                    </div>

                    {/* Toggle Telegram */}
                    <div className={styles.toggleGroup}>
                        <label className={styles.toggleLabel}>
                            <div className={styles.toggleWrapper}>
                                <input
                                    type="checkbox"
                                    className={styles.toggleInput}
                                    checked={notificationSettings.telegram_notifications}
                                    onChange={() => handleNotificationToggle('telegram')}
                                />
                                <span className={styles.toggleSlider}></span>
                            </div>
                            <span className={styles.toggleText}>Recibe alertas en Telegram</span>
                        </label>
                    </div>

                    {/* Campo ID de Telegram */}
                    <div className={styles.telegramIdSection}>
                        <label className={styles.fieldLabel} htmlFor="telegram_id">ID de Telegram</label>
                        <input
                            type="text"
                            id="telegram_id"
                            className={styles.formInput}
                            value={notificationSettings.telegram_chat_id}
                            onChange={handleTelegramIdChange}
                            placeholder="1393684739"
                        />
                    </div>

                    {/* Instrucciones */}
                    <div className={styles.instructionsSection}>
                        <h4 className={styles.instructionsTitle}>¿Cómo obtener el ChatID de Telegram?</h4>
                        <p className={styles.instructionsSubtitle}>
                            Siga los siguientes pasos para obtener el chat id de Telegram:
                        </p>

                        <ul className={styles.instructionsList}>
                            <li className={styles.instructionItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <div>
                                    <span>Abrimos el navegador y nos dirigimos al siguiente link </span>
                                    <a 
                                        href="https://web.telegram.org" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.instructionLink}
                                    >
                                        https://web.telegram.org
                                    </a>
                                </div>
                            </li>
                            <li className={styles.instructionItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <span>Escribimos nuestro número de celular en el campo correspondiente.</span>
                            </li>
                            <li className={styles.instructionItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <div>
                                    <span>Telegram nos enviará un </span>
                                    <code className={styles.codeText}>código</code>
                                    <span> de inicio de sesión que contiene </span>
                                    <code className={styles.codeText}>seis dígitos</code>
                                    <span> a la aplicación móvil. Utilizamos ese número para iniciar sesión.</span>
                                </div>
                            </li>
                            <li className={styles.instructionItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <div>
                                    <span>Damos un clic en el cuadro de búsqueda en la esquina superior izquierda de la pantalla. Escribimos </span>
                                    <code className={styles.codeText}>@RawDataBot»</code>
                                    <span> y pulsamos </span>
                                    <code className={styles.codeText}>«Enter»</code>
                                    <span>.</span>
                                </div>
                            </li>
                            <li className={styles.instructionItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <div>
                                    <span>Damos un clic en </span>
                                    <code className={styles.codeText}>«Telegram Bot Raw»</code>
                                    <span> para conseguir un mensaje que contenga nuestra información de chat.</span>
                                </div>
                            </li>
                            <li className={styles.instructionItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <div>
                                    <span>Buscamos el ID en el JSON resultado </span>
                                    <code className={styles.codeText}>"id": 1393684739</code>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Botón guardar en la parte inferior derecha */}
                <div className={styles.notificationActionsBottom}>
                    <button 
                        className={styles.saveButton}
                        onClick={handleSaveNotifications}
                    >
                        Guardar
                    </button>
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
