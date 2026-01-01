import React from 'react'

import Image from 'next/image'

import { UserInfoForm } from './types'
import styles from '../styles.module.css'

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
            {/* Panel izquierdo - Formulario */}
            <div className={styles.infoPanel}>
                <div className={styles.infoSection}>
                    <h2 className={styles.sectionTitle}>Actualiza tú perfil</h2>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
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

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Imágen de perfil actual
                                <span className={styles.labelSubtext}>Imágen de perfil actual</span>
                            </label>
                            
                            <div className={styles.imagePreviewContainer}>
                                <div className={styles.imagePreview}>
                                    {previewImage ? (
                                        <Image src={previewImage} alt="Preview" className={styles.previewImg} width={200} height={200} />
                                    ) : (
                                        <div className={styles.placeholderImage}>
                                            👤
                                        </div>
                                    )}
                                </div>

                                <div className={styles.imageUploadSection}>
                                    <label className={styles.formLabel}>
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
                            <button type="submit" className={styles.submitButton}>
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
                        {userInfo.rol_detail?.nombre?.toUpperCase() || 'ADMINISTRADOR'}
                    </div>
                </div>

                <div className={styles.profileCardInfo}>
                    <h3 className={styles.profileName}>
                        {userInfo.full_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Sin nombre'}
                    </h3>

                    <div className={styles.profileDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailValue}>{userInfo.email || 'guillonix@gmail.com'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Username:</span>
                            <span className={styles.detailValue}>{userInfo.username || 'Memo'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Última conexión:</span>
                            <span className={styles.detailValue}>
                                {userInfo.last_login ? formatDate(userInfo.last_login) : '2026-01-01 11:36:56'}
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
        </div>
    )
}
