'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CancelIcon from '@mui/icons-material/Cancel'
import SaveIcon from '@mui/icons-material/Save'
import ShieldIcon from '@mui/icons-material/Shield'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { emqxAclService, type UpdateEmqxAclDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createMqtt.module.css'

const EditEmqxAclPage = () => {
    const router = useRouter()
    const params = useParams()
    const aclId = parseInt(params.aclId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'emqx_acl',
        action: 'update'
    })

    // ---- Estados ----
    const [formData, setFormData] = useState<UpdateEmqxAclDto>({
        username: '',
        topic: '',
        action: 'all',
        permission: 'allow'
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    // ---- Cargar datos ----
    const loadAcl = useCallback(async () => {
        try {
            showLoader(true)
            const acl = await emqxAclService.getById(aclId)

            setFormData({
                username: acl.username,
                topic: acl.topic,
                action: acl.action,
                permission: acl.permission
            })
            setLoading(false)
        } catch (error) {
            console.error('Error cargando ACL:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la regla ACL'
            }).then(() => {
                router.push('/gestor_mqtt/acl')
            })
        } finally {
            showLoader(false)
        }
    }, [aclId, showLoader, router])

    useEffect(() => {
        loadAcl()
    }, [loadAcl])

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
    const handleChange = (field: string, value: string) => {
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
            await emqxAclService.update(aclId, formData)

            Swal.fire({
                icon: 'success',
                title: 'Regla ACL actualizada',
                text: 'La regla de control de acceso ha sido actualizada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt/acl')
        } catch (error: unknown) {
            console.error('Error actualizando ACL:', error)
            const errorMessage = error instanceof Error && 'response' in error
                ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'No se pudo actualizar la regla ACL')
                : 'No se pudo actualizar la regla ACL'
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
        router.push('/gestor_mqtt/acl')
    }

    if (loading) {
        return null
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
                <h2 className={styles.sectionTitle}>Editar Regla ACL EMQX</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Modifique la configuración de control de acceso
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
                            <span className={styles.labelSubtext}>Patrón del topic (use + para un nivel, # para varios niveles)</span>
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
                        marginTop: '1rem'
                    }}>
                        <strong>📋 Ejemplos de patrones de topics:</strong>
                        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                            <li><code>sensors/+/temperature</code> - Un nivel variable</li>
                            <li><code>sensors/#</code> - Múltiples niveles</li>
                            <li><code>devices/ESP32-001/data</code> - Topic específico</li>
                        </ul>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            <CancelIcon /> Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Actualizar Regla
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
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Topic:</span>
                        <span className={styles.previewValue}>
                            {formData.topic || 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Acción:</span>
                        <span className={styles.previewValue}>
                            {formData.action ? actionOptions.find(a => a.value === formData.action)?.label : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Permiso:</span>
                        <span className={styles.previewValue}>
                            {formData.permission ? permissionOptions.find(p => p.value === formData.permission)?.label : 'No especificado'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditEmqxAclPage
