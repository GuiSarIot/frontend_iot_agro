'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { IconButton, InputAdornment, TextField } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Checkbox } from 'primereact/checkbox'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { mqttCredentialsService, type CreateMqttCredentialDto } from '@/app/services/mqtt.service'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { useAppContext } from '@/context/appContext'

import styles from './createMqtt.module.css'

const CreateCredentialPage = () => {
    const router = useRouter()
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'other',
        action: 'create'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [formData, setFormData] = useState<CreateMqttCredentialDto>({
        dispositivo: 0,
        client_id: '',
        username: '',
        password: '',
        use_device_cert: false,
        is_active: true
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)

    // ---- Cargar dispositivos ----
    useEffect(() => {
        loadDispositivos()
    }, [])

    const loadDispositivos = useCallback(async () => {
        try {
            showLoader(true)
            const response = await dispositivosService.getAll()
            setDispositivos(response.results)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los dispositivos'
            })
        } finally {
            showLoader(false)
        }
    }, [showLoader])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.dispositivo) {
            newErrors.dispositivo = 'El dispositivo es requerido'
        }

        if (!formData.client_id.trim()) {
            newErrors.client_id = 'El Client ID es requerido'
        }

        if (!formData.username.trim()) {
            newErrors.username = 'El username es requerido'
        }

        if (!formData.use_device_cert && !formData.password) {
            newErrors.password = 'La contraseña es requerida si no usa certificado'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        // Auto-generar client_id y username basado en dispositivo
        if (field === 'dispositivo' && value) {
            const dispositivo = dispositivos.find(d => d.id === value)
            if (dispositivo) {
                const generatedId = `device_${dispositivo.nombre.replace(/\s+/g, '-').toUpperCase()}`
                setFormData(prev => ({
                    ...prev,
                    dispositivo: value,
                    client_id: generatedId,
                    username: generatedId
                }))
            }
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
            await mqttCredentialsService.create(formData)

            Swal.fire({
                icon: 'success',
                title: 'Credencial creada',
                text: 'La credencial MQTT ha sido creada exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt/credentials')
        } catch (error: any) {
            console.error('Error creando credencial:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.detail || 'No se pudo crear la credencial'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleCancel = () => {
        router.push('/gestor_mqtt/credentials')
    }

    const dispositivoOptions = dispositivos.map(d => ({
        label: d.nombre,
        value: d.id
    }))

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Crear Credencial MQTT</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Configure credenciales de autenticación MQTT para un dispositivo.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
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

                    {!formData.use_device_cert && (
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                <span className={styles.labelText}>
                                    Contraseña<span className={styles.required}>*</span>
                                </span>
                                <span className={styles.labelSubtext}>Contraseña para autenticación MQTT</span>
                            </label>
                            <div>
                                <TextField
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Ingrese contraseña segura"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={!!errors.password}
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
                                {errors.password && (
                                    <small className={styles.errorText}>{errors.password}</small>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Estado
                            <span className={styles.labelSubtext}>Activar credencial inmediatamente</span>
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

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Guardar Credencial
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <VpnKeyIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>CREDENCIAL MQTT</p>
                    <h3 className={styles.previewName}>
                        {formData.client_id || 'Nueva Credencial'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Dispositivo:</span>
                        <span className={styles.detailValue}>
                            {formData.dispositivo 
                                ? dispositivos.find(d => d.id === formData.dispositivo)?.nombre || 'No especificado'
                                : 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Username:</span>
                        <span className={styles.detailValue}>
                            {formData.username || 'No especificado'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Autenticación:</span>
                        <span className={styles.detailValue}>
                            {formData.use_device_cert ? 'Certificado X.509' : 'Usuario/Contraseña'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Estado:</span>
                        <span className={styles.detailValue}>
                            {formData.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateCredentialPage
