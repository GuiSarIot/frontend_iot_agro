'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import { dispositivosService, type Dispositivo } from '@/app/services/api.service'
import { emqxUsersService, type CreateEmqxUserWithAclDto } from '@/app/services/mqtt.service'
import { useAppContext } from '@/context/appContext'

import styles from './createMqtt.module.css'

interface AclRule {
    topic: string
    action: 'publish' | 'subscribe' | 'all'
    permission: 'allow' | 'deny'
}

const CreateEmqxUserPage = () => {
    const router = useRouter()
    const { showLoader } = useAppContext()

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'emqx_users',
        action: 'create'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [formData, setFormData] = useState<CreateEmqxUserWithAclDto>({
        username: '',
        password: '',
        dispositivo: undefined,
        is_superuser: false,
        acl_rules: []
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // ---- Opciones ----
    const actionOptions = [
        { label: 'Publish', value: 'publish' },
        { label: 'Subscribe', value: 'subscribe' },
        { label: 'All', value: 'all' }
    ]

    const permissionOptions = [
        { label: 'Allow', value: 'allow' },
        { label: 'Deny', value: 'deny' }
    ]

    // ---- Cargar dispositivos ----
    const loadDispositivos = useCallback(async () => {
        try {
            const response = await dispositivosService.getAll()
            setDispositivos(response.results)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }, [])

    useEffect(() => {
        loadDispositivos()
    }, [loadDispositivos])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.username.trim()) {
            newErrors.username = 'El username es requerido'
        }

        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida'
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Manejadores ----
    const handleChange = (field: string, value: string | number | boolean | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleAddAclRule = () => {
        setFormData(prev => ({
            ...prev,
            acl_rules: [
                ...prev.acl_rules,
                { topic: '', action: 'publish', permission: 'allow' }
            ]
        }))
    }

    const handleRemoveAclRule = (index: number) => {
        setFormData(prev => ({
            ...prev,
            acl_rules: prev.acl_rules.filter((_, i) => i !== index)
        }))
    }

    const handleAclRuleChange = (index: number, field: keyof AclRule, value: string) => {
        setFormData(prev => ({
            ...prev,
            acl_rules: prev.acl_rules.map((rule, i) => 
                i === index ? { ...rule, [field]: value } : rule
            )
        }))
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
            
            if (formData.acl_rules.length > 0) {
                await emqxUsersService.createWithAcl(formData)
            } else {
                await emqxUsersService.create(formData)
            }

            Swal.fire({
                icon: 'success',
                title: 'Usuario creado',
                text: 'El usuario EMQX ha sido creado exitosamente',
                timer: 2000,
                showConfirmButton: false
            })

            router.push('/gestor_mqtt/users')
        } catch (error: unknown) {
            console.error('Error creando usuario:', error)
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail 
                : 'No se pudo crear el usuario'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            })
        } finally {
            showLoader(false)
        }
    }

    const _handleCancel = () => {
        router.push('/gestor_mqtt/users')
    }

    const dispositivoOptions = [
        { label: 'Sin asignar', value: undefined },
        ...dispositivos.map(d => ({ label: d.nombre, value: d.id }))
    ]

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Crear Usuario EMQX</h2>
                <p className={styles.sectionDescription}>
                    <strong>Nota:</strong> Cree un nuevo usuario para autenticación MQTT en EMQX.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <span className={styles.labelText}>
                                Username<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Usuario para autenticación MQTT</span>
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
                                Contraseña<span className={styles.required}>*</span>
                            </span>
                            <span className={styles.labelSubtext}>Mínimo 6 caracteres</span>
                        </label>
                        <div>
                            <Password
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Contraseña segura"
                                toggleMask
                                className={errors.password ? 'p-invalid' : ''}
                                style={{ width: '100%', maxWidth: '600px' }}
                            />
                            {errors.password && (
                                <small className={styles.errorText}>{errors.password}</small>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Dispositivo
                            <span className={styles.labelSubtext}>Vincular usuario a un dispositivo (opcional)</span>
                        </label>
                        <Dropdown
                            value={formData.dispositivo}
                            options={dispositivoOptions}
                            onChange={(e) => handleChange('dispositivo', e.value)}
                            placeholder="Seleccione un dispositivo (opcional)"
                            filter
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Opciones
                            <span className={styles.labelSubtext}>Configuración de permisos</span>
                        </label>
                        <div className={styles.checkboxGroup}>
                            <Checkbox
                                inputId="is_superuser"
                                checked={formData.is_superuser}
                                onChange={(e) => handleChange('is_superuser', e.checked)}
                            />
                            <label htmlFor="is_superuser" className={styles.checkboxLabel}>
                                Superusuario (permisos completos)
                            </label>
                        </div>
                    </div>

                    {/* Reglas ACL */}
                    <div className={styles.formGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label className={styles.formLabel} style={{ marginBottom: 0 }}>
                                Reglas ACL
                                <span className={styles.labelSubtext}>Control de acceso a topics</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleAddAclRule}
                                style={{
                                    padding: '6px 12px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <AddIcon style={{ fontSize: '18px' }} /> Añadir Regla
                            </button>
                        </div>

                        {formData.acl_rules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {formData.acl_rules.map((rule, index) => (
                                    <div key={index} style={{ 
                                        padding: '1rem', 
                                        background: '#f8f9fa', 
                                        borderRadius: '8px',
                                        position: 'relative',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAclRule(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                padding: '4px 8px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <DeleteIcon style={{ fontSize: '16px' }} />
                                        </button>

                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                                Topic
                                            </label>
                                            <InputText
                                                value={rule.topic}
                                                onChange={(e) => handleAclRuleChange(index, 'topic', e.target.value)}
                                                placeholder="iot/sensors/+/data"
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                                    Acción
                                                </label>
                                                <Dropdown
                                                    value={rule.action}
                                                    options={actionOptions}
                                                    onChange={(e) => handleAclRuleChange(index, 'action', e.value)}
                                                    placeholder="Seleccione acción"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                                    Permiso
                                                </label>
                                                <Dropdown
                                                    value={rule.permission}
                                                    options={permissionOptions}
                                                    onChange={(e) => handleAclRuleChange(index, 'permission', e.value)}
                                                    placeholder="Seleccione permiso"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                No hay reglas ACL configuradas. Haga clic en "Añadir Regla" para agregar una.
                            </p>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            <SaveIcon /> Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatar}>
                            <PersonIcon style={{ fontSize: '3rem' }} />
                        </div>
                    </div>
                    <p className={styles.previewTitle}>USUARIO EMQX</p>
                    <h3 className={styles.previewName}>
                        {formData.username || 'Nuevo Usuario'}
                    </h3>
                </div>

                <div className={styles.previewDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Dispositivo:</span>
                        <span className={styles.detailValue}>
                            {formData.dispositivo 
                                ? dispositivos.find(d => d.id === formData.dispositivo)?.nombre || 'Sin asignar'
                                : 'Sin asignar'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Superusuario:</span>
                        <span className={styles.detailValue}>
                            {formData.is_superuser ? 'Sí' : 'No'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Reglas ACL:</span>
                        <span className={styles.detailValue}>
                            {formData.acl_rules.length} regla(s)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateEmqxUserPage
