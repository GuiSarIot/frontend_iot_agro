'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { IconButton, InputAdornment, TextField } from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import LockIcon from '@mui/icons-material/Lock'
import SaveIcon from '@mui/icons-material/Save'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { mqttCredentialsService, type UpdateMqttCredentialDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from '../crear/createMqtt.module.css'

const EditCredentialPage = () => {
    const router = useRouter()
    const params = useParams()
    const credentialId = parseInt(params.credentialId as string)
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'other',
        action: 'update'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [formData, setFormData] = useState<UpdateMqttCredentialDto>({
        dispositivo: 0,
        client_id: '',
        username: '',
        password: '',
        use_device_cert: false,
        is_active: true
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [showPassword, setShowPassword] = useState(false)

    // ---- Cargar datos ----
    const loadDispositivos = useCallback(async () => {
        try {
            const response = await dispositivosService.getAll()
            setDispositivos(response.results)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }, [])

    const loadCredential = useCallback(async () => {
        try {
            showLoader(true)
            const credential = await mqttCredentialsService.getById(credentialId)
            setFormData({
                dispositivo: credential.dispositivo,
                client_id: credential.client_id,
                username: credential.username,
                password: '',
                use_device_cert: credential.use_device_cert,
                is_active: credential.is_active
            })
            setLoading(false)
        } catch (error) {
            console.error('Error cargando credencial:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la credencial'
            }).then(() => {
                router.push('/gestor_mqtt/credentials')
            })
        } finally {
            showLoader(false)
        }
    }, [credentialId, router, showLoader])

    useEffect(() => {
        loadDispositivos()
        loadCredential()
    }, [loadDispositivos, loadCredential])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.dispositivo) {
            newErrors.dispositivo = 'El dispositivo es requerido'
        }

        if (!formData.client_id?.trim()) {
            newErrors.client_id = 'El Client ID es requerido'
        }

        if (!formData.username?.trim()) {
            newErrors.username = 'El username es requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: string | number | boolean) => {
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
            
            // Si no se cambió la contraseña, no la enviamos
            const updateData = { ...formData }
            if (!updateData.password) {
                delete updateData.password
            }

            await mqttCredentialsService.update(credentialId, updateData)

            Swal.fire({
                icon: 'success',
                title: 'Credencial actualizada',
                text: 'La credencial MQTT ha sido actualizada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt/credentials')
        } catch (error: unknown) {
            console.error('Error actualizando credencial:', error)
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : 'No se pudo actualizar la credencial'
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
        router.push('/gestor_mqtt/credentials')
    }

    if (loading) {
        return null
    }

    const dispositivoOptions = dispositivos.map(d => ({
        label: d.nombre,
        value: d.id
    }))

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Editar Credencial MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Modifique las credenciales de autenticación MQTT
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Dispositivo */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Dispositivo<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Dispositivo asociado</span>
                        </label>
                        <div>
                            <Dropdown
                                value={formData.dispositivo}
                                options={dispositivoOptions}
                                onChange={(e) => handleChange('dispositivo', e.value)}
                                placeholder="Seleccione un dispositivo"
                                filter
                                className={errors.dispositivo ? 'p-invalid' : ''}
                            />
                            {errors.dispositivo && (
                                <small className={styles.errorText}>{errors.dispositivo}</small>
                            )}
                        </div>
                    </div>

                    {/* Client ID */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Client ID<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Identificador único del cliente MQTT</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.client_id}
                                onChange={(e) => handleChange('client_id', e.target.value)}
                                placeholder="device_SENSOR-001"
                                className={errors.client_id ? 'p-invalid' : ''}
                            />
                            {errors.client_id && (
                                <small className={styles.errorText}>{errors.client_id}</small>
                            )}
                        </div>
                    </div>

                    {/* Username */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Username<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Usuario MQTT</span>
                        </label>
                        <div>
                            <InputText
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                placeholder="device_SENSOR-001"
                                className={errors.username ? 'p-invalid' : ''}
                            />
                            {errors.username && (
                                <small className={styles.errorText}>{errors.username}</small>
                            )}
                        </div>
                    </div>

                    {/* Opciones de Autenticación */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Opciones de Autenticación
                            <span className={styles.labelSubtext}>Configuración de seguridad</span>
                        </label>
                        <div className={styles.checkboxGroup}>
                            <Checkbox
                                inputId="use_device_cert"
                                checked={formData.use_device_cert}
                                onChange={(e) => handleChange('use_device_cert', e.checked)}
                            />
                            <label htmlFor="use_device_cert" className={styles.checkboxLabel}>
                                Usar certificado X.509
                            </label>
                        </div>
                    </div>

                    {/* Contraseña */}
                    {!formData.use_device_cert && (
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                <span className={styles.labelText}>
                                    Contraseña
                                </span>
                                <span className={styles.labelSubtext}>Dejar en blanco para mantener la contraseña actual</span>
                            </label>
                            <div>
                                <TextField
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Dejar vacío para no cambiar"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ maxWidth: '600px' }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Estado */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Estado
                            <span className={styles.labelSubtext}>Estado de la credencial</span>
                        </label>
                        <div className={styles.checkboxGroup}>
                            <Checkbox
                                inputId="is_active"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.checked)}
                            />
                            <label htmlFor="is_active" className={styles.checkboxLabel}>
                                Activo
                            </label>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className={styles.formActions}>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            <CancelIcon /> Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Actualizar Credencial
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <LockIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>CREDENCIAL MQTT</p>
                    <h3 className={styles.previewName}>
                        {formData.client_id || 'device_XXX'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Dispositivo:</span>
                        <span className={styles.previewValue}>
                            {dispositivos.find(d => d.id === formData.dispositivo)?.nombre || 'No seleccionado'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Username:</span>
                        <span className={styles.previewValue}>{formData.username || 'No especificado'}</span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Autenticación:</span>
                        <span className={styles.previewValue}>
                            {formData.use_device_cert ? 'Certificado X.509' : 'Usuario/Contraseña'}
                        </span>
                    </div>
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Estado:</span>
                        <span className={formData.is_active ? styles.statusActive : styles.statusInactive}>
                            {formData.is_active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditCredentialPage
