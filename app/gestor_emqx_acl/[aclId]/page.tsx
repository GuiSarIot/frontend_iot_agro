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

import styles from '../../gestor_mqtt_brokers/crear/createBroker.module.css'

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
                router.push('/gestor_emqx_acl')
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

            router.push('/gestor_emqx_acl')
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
        router.push('/gestor_emqx_acl')
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
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <ShieldIcon sx={{ fontSize: 30 }} />
                    Editar Regla ACL EMQX
                </h1>
                <p className={styles.subtitle}>
                    Modifique la configuración de control de acceso
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formCard}>
                    {/* Información de la Regla */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Información de la Regla</h2>

                        <div className={styles.formRow}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.label}>
                                    Username <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="device_ESP32-001"
                                    className={errors.username ? 'p-invalid' : ''}
                                />
                                {errors.username && (
                                    <small className={styles.error}>{errors.username}</small>
                                )}
                                <small className={styles.helpText}>
                                    Usuario EMQX al que aplica esta regla
                                </small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.label}>
                                    Topic Pattern <span className={styles.required}>*</span>
                                </label>
                                <InputText
                                    value={formData.topic}
                                    onChange={(e) => handleChange('topic', e.target.value)}
                                    placeholder="sensors/temperature/+"
                                    className={errors.topic ? 'p-invalid' : ''}
                                />
                                {errors.topic && (
                                    <small className={styles.error}>{errors.topic}</small>
                                )}
                                <small className={styles.helpText}>
                                    Patrón del topic (use + para un nivel, # para varios niveles)
                                </small>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Acción <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.action}
                                    options={actionOptions}
                                    onChange={(e) => handleChange('action', e.value)}
                                    placeholder="Seleccione acción"
                                    className={errors.action ? 'p-invalid' : ''}
                                />
                                {errors.action && (
                                    <small className={styles.error}>{errors.action}</small>
                                )}
                                <small className={styles.helpText}>
                                    Operación permitida/denegada
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Permiso <span className={styles.required}>*</span>
                                </label>
                                <Dropdown
                                    value={formData.permission}
                                    options={permissionOptions}
                                    onChange={(e) => handleChange('permission', e.value)}
                                    placeholder="Seleccione permiso"
                                    className={errors.permission ? 'p-invalid' : ''}
                                />
                                {errors.permission && (
                                    <small className={styles.error}>{errors.permission}</small>
                                )}
                                <small className={styles.helpText}>
                                    Permitir o denegar el acceso
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Ejemplos */}
                    <div className={styles.formSection}>
                        <div style={{ 
                            padding: '1rem', 
                            background: '#f8f9fa', 
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                        }}>
                            <strong>📋 Ejemplos de patrones de topics:</strong>
                            <ul style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                <li><code>sensors/+/temperature</code> - Un nivel variable</li>
                                <li><code>sensors/#</code> - Múltiples niveles</li>
                                <li><code>devices/ESP32-001/data</code> - Topic específico</li>
                            </ul>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                        >
                            <CancelIcon /> Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <SaveIcon /> Actualizar Regla
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditEmqxAclPage
