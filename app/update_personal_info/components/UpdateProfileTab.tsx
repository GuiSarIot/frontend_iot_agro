import React from 'react'

import Image from 'next/image'

import { UserInfoForm } from './types'
import styles from './UpdateProfileTab.module.css'

interface UpdateProfileTabProps {
    userInfo: UserInfoForm
    formData: {
        full_name: string
        username: string
        telefono: string
        email: string
    }
    selectedFile: File | null
    previewImage: string
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export default function UpdateProfileTab({
    userInfo,
    formData,
    selectedFile,
    previewImage,
    getInitials,
    formatDate,
    handleInputChange,
    handleFileSelect,
    handleSubmit
}: UpdateProfileTabProps) {
    return (
        <div className={styles.contentLayout}>
            <div className={styles.infoPanel}>
                <div className={styles.infoSection}>
                    <h2 className={styles.sectionTitle}>Actualiza tú perfil</h2>
                    <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-color-secondary)' }}>
                        Edita los datos, como correo, teléfono, nombre, etc.
                    </p>

                    <form className={styles.updateForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="full_name" className={styles.formLabel}>
                                Nombre completo
                                <span className={styles.labelSubtext}>Su nombre y apellidos</span>
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                className={styles.formInput}
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Guillermo Sarmiento"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="username" className={styles.formLabel}>
                                Nombre de usuario (MQTT)
                                <span className={styles.labelSubtext}>Usuario para la conexión MQTT</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                className={styles.formInput}
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Memo"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="telefono" className={styles.formLabel}>
                                Teléfono
                                <span className={styles.labelSubtext}>Teléfono de contacto</span>
                            </label>
                            <input
                                type="tel"
                                id="telefono"
                                className={styles.formInput}
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="3211234567"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                Correo electrónico
                                <span className={styles.labelSubtext}>Correo electrónico de contacto (Login)</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className={styles.formInput}
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="guillonix@gmail.com"
                            />
                        </div>

                        <div className={styles.imageSection}>
                            <div className={styles.imagePreview}>
                                {previewImage ? (
                                    <Image src={previewImage} alt="Preview" className={styles.previewImg} width={160} height={160} />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className={styles.imageUploadSection}>
                                <div className={styles.imageInfoGroup}>
                                    <label className={styles.imageLabel}>
                                        Imágen de perfil actual
                                    </label>
                                    <span className={styles.imageLabelSubtext}>Imágen de perfil actual</span>
                                </div>

                                <div className={styles.imageInfoGroup}>
                                    <label className={styles.imageLabel}>
                                        Nueva imágen
                                    </label>
                                    <div className={styles.fileInputWrapper}>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            placeholder={selectedFile?.name || 'Selecciona una imagen'}
                                            readOnly
                                        />
                                        <label htmlFor="fileInput" className={styles.browseButton}>
                                            Browse
                                        </label>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit" className="btn-primary">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Panel derecho - Card de perfil */}
            <div className={`${styles.profileCard} ${styles.profileCardCompact}`}>
                <div className={styles.profileCardHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            {getInitials(userInfo.first_name, userInfo.last_name)}
                        </div>
                    </div>

                    <div className={styles.roleBadge}>
                        {userInfo.rol_detail?.nombre?.toUpperCase() || 'SUPERUSUARIO'}
                    </div>
                </div>

                <div className={styles.profileCardInfo}>
                    <h3 className={styles.profileName}>
                        {userInfo.full_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Super Admin 2'}
                    </h3>

                    <div className={styles.profileDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailValue}>{userInfo.email || 'guillonix@gmail.com'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Username:</span>
                            <span className={styles.detailValue}>{userInfo.username || 'admin'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Última conexión:</span>
                            <span className={styles.detailValue}>
                                {userInfo.last_login ? formatDate(userInfo.last_login) : '01/01/2026, 02:25:35 p. m.'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.profileActions}>
                        <button className={styles.actionButton} title="Desactivar notificaciones" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z"/>
                            </svg>
                        </button>
                        <button className={styles.actionButton} title="Enviar mensaje" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </button>
                        <button className={styles.actionButton} title="Comentar" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                            </svg>
                        </button>
                        <button className={styles.actionButton} title="Guardar" type="button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
