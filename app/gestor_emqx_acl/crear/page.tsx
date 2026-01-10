'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import SaveIcon from '@mui/icons-material/Save'
import ShieldIcon from '@mui/icons-material/Shield'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { emqxAclService, type CreateEmqxAclDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from './createMqtt.module.css'

const CreateEmqxAclPage = () => {
    const router = useRouter()
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'emqx_acl',
        action: 'create'
    })

    // ---- Estados ----
    const [formData, setFormData] = useState<CreateEmqxAclDto>({
        emqx_user: 0,
        username: '',
        topic: '',
        action: 'all',
        permission: 'allow'
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.username?.trim()) {
            newErrors.username = 'El username es requerido'
        }

        if (!formData.topic?.trim()) {
            newErrors.topic = 'El topic es requerido'
        }

        if (!formData.action) {
            newErrors.action = 'La acción es requerida'
        }

        if (!formData.permission) {
            newErrors.permission = 'El permiso es requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Errores en el formulario',
                text: 'Por favor, corrija los errores antes de continuar'
            })
            return
        }

        try {
            showLoader(true)
            await emqxAclService.create(formData)

            Swal.fire({
                icon: 'success',
                title: 'Regla ACL creada',
                text: 'La regla de control de acceso ha sido creada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_emqx_acl')
        } catch (error: unknown) {
            console.error('Error creando ACL:', error)
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : 'No se pudo crear la regla ACL'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_emqx_acl')
    }

    const actionOptions = [
        { label: 'Publicar', value: 'publish' },
        { label: 'Suscribir', value: 'subscribe' },
        { label: 'Ambos', value: 'all' }
    ]

    const permissionOptions = [
        { label: 'Permitir', value: 'allow' },
        { label: 'Denegar', value: 'deny' }
    ]

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Crear Regla ACL EMQX</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Configure el control de acceso para un usuario y topic específico.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Username<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Usuario EMQX al que aplica esta regla</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                placeholder="device_ESP32-001"
                                className={errors.username ? 'p-invalid' : ''}
                            />
                            {errors.username && (
                                <small className={styles.errorText}>{errors.username}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Topic Pattern<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Use + para un nivel, # para varios niveles</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.topic}
                                onChange={(e) => handleChange('topic', e.target.value)}
                                placeholder="sensors/temperature/+"
                                className={errors.topic ? 'p-invalid' : ''}
                            />
                            {errors.topic && (
                                <small className={styles.errorText}>{errors.topic}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Acción<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Operación permitida/denegada</span>
                        </label>
                        <div>
                            <Dropdown
                                value={formData.action}
                                options={actionOptions}
                                onChange={(e) => handleChange('action', e.value)}
                                placeholder="Seleccione acción"
                                className={errors.action ? 'p-invalid' : ''}
                            />
                            {errors.action && (
                                <small className={styles.errorText}>{errors.action}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Permiso<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Permitir o denegar el acceso</span>
                        </label>
                        <div>
                            <Dropdown
                                value={formData.permission}
                                options={permissionOptions}
                                onChange={(e) => handleChange('permission', e.value)}
                                placeholder="Seleccione permiso"
                                className={errors.permission ? 'p-invalid' : ''}
                            />
                            {errors.permission && (
                                <small className={styles.errorText}>{errors.permission}</small>
                            )}
                        </div>
                    </div>

                    {/* Ejemplos */}
                    <div style={{ 
                        padding: '1rem', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        marginTop: '1.5rem'
                    }}>
                        <strong>📋 Ejemplos de patrones de topics:</strong>
                        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
                            <li><code>sensors/+/temperature</code> - Un nivel variable</li>
                            <li><code>sensors/#</code> - Múltiples niveles</li>
                            <li><code>devices/ESP32-001/data</code> - Topic específico</li>
                        </ul>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Crear Regla ACL
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <ShieldIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>REGLA ACL EMQX</p>
                    <h3 className={styles.previewName}>
                        {formData.username || 'Nueva Regla ACL'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Topic:</span>
                        <span className={styles.detailValue}>
                            {formData.topic || 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Acción:</span>
                        <span className={styles.detailValue}>
                            {formData.action ? actionOptions.find(a => a.value === formData.action)?.label : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Permiso:</span>
                        <span className={styles.detailValue}>
                            {formData.permission ? permissionOptions.find(p => p.value === formData.permission)?.label : 'No especificado'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateEmqxAclPage
