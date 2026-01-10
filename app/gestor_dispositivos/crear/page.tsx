'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DevicesIcon from '@mui/icons-material/Devices'
import SaveIcon from '@mui/icons-material/Save'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import Swal from 'sweetalert2'

import { dispositivosService, type TipoDispositivo } from '@/app/services/api.service'

import styles from './crear.module.css'

// ---- Interfaces ----
interface FormData {
    nombre: string
    tipo: string
    identificador_unico: string
    estado: string
    ubicacion: string
    descripcion: string
}

interface FormErrors {
    nombre?: string
    tipo?: string
    identificador_unico?: string
    ubicacion?: string
}

// ---- Opciones por defecto (fallback) ----
const TIPOS_DISPOSITIVO_DEFAULT = [
    { label: 'Raspberry Pi', value: 'raspberry_pi' },
    { label: 'ESP32', value: 'esp32' },
    { label: 'Arduino', value: 'arduino' },
    { label: 'ESP8266', value: 'esp8266' },
    { label: 'Otro', value: 'otro' }
]

const ESTADOS = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
    { label: 'Mantenimiento', value: 'mantenimiento' }
]

// ---- Componente principal ----
export default function CrearDispositivoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [tiposDispositivo, setTiposDispositivo] = useState<TipoDispositivo[]>([])
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        tipo: '',
        identificador_unico: '',
        estado: 'activo',
        ubicacion: '',
        descripcion: ''
    })
    const [errors, setErrors] = useState<FormErrors>({})

    // Cargar tipos de dispositivos al montar
    useEffect(() => {
        loadTipos()
    }, [])

    const loadTipos = async () => {
        try {
            const tipos = await dispositivosService.getTipos()
            setTiposDispositivo(tipos)
        } catch (error) {
            console.error('Error al cargar tipos:', error)
            // Usar tipos por defecto si falla
            setTiposDispositivo(TIPOS_DISPOSITIVO_DEFAULT)
        }
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        } else if (formData.nombre.trim().length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
        }

        if (!formData.tipo) {
            newErrors.tipo = 'El tipo de dispositivo es requerido'
        }

        if (!formData.identificador_unico.trim()) {
            newErrors.identificador_unico = 'El identificador único es requerido'
        } else if (formData.identificador_unico.trim().length < 3) {
            newErrors.identificador_unico = 'El identificador debe tener al menos 3 caracteres'
        }

        if (!formData.ubicacion.trim()) {
            newErrors.ubicacion = 'La ubicación es requerida'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            Swal.fire({
                title: 'Errores en el formulario',
                text: 'Por favor corrige los errores antes de continuar',
                icon: 'warning',
                confirmButtonText: 'Ok'
            })
            return
        }

        setLoading(true)

        try {
            await dispositivosService.create({
                nombre: formData.nombre.trim(),
                tipo: formData.tipo,
                identificador_unico: formData.identificador_unico.trim(),
                estado: formData.estado,
                ubicacion: formData.ubicacion.trim(),
                descripcion: formData.descripcion.trim() || undefined
            })

            setLoading(false)

            Swal.fire({
                title: 'Éxito',
                text: 'Dispositivo creado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                router.push('/gestor_dispositivos')
            })

        } catch (error) {
            console.error('Error al crear dispositivo:', error)
            setLoading(false)
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error inesperado al crear el dispositivo',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    const handleCancel = () => {
        const hasData = formData.nombre || formData.tipo || formData.identificador_unico || 
                        formData.ubicacion || formData.descripcion
        
        if (hasData) {
            Swal.fire({
                title: '¿Descartar cambios?',
                text: 'Se perderán todos los datos ingresados',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--error)',
                cancelButtonColor: 'var(--secondary)',
                confirmButtonText: 'Sí, descartar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/gestor_dispositivos')
                }
            })
        } else {
            router.push('/gestor_dispositivos')
        }
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.contentLayout}>
                    {/* Panel del formulario */}
                    <div className={styles.formPanel}>
                        {/* Header dentro del panel */}
                        <div className={styles.header}>
                            <button type="button" onClick={handleCancel} className={styles.btnBack}>
                                <ArrowBackIcon />
                                <span>Volver</span>
                            </button>
                            
                            <div className={styles.titleSection}>
                                <h1 className={styles.pageTitle}>Crear nuevo dispositivo</h1>
                                <p className={styles.noteText}>
                                    <strong>Nota:</strong> Ingresa la información del dispositivo IoT que deseas registrar en el sistema.
                                </p>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            {/* Nombre del dispositivo */}
                            <div className={styles.formGroup}>
                                <label htmlFor="nombre" className={styles.formLabel}>
                                    Nombre del dispositivo*
                                    <span className={styles.labelSubtext}>Nombre descriptivo único</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputText
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                                        placeholder="Ej: Sensor Principal Invernadero 1"
                                        className={`${styles.formInput} ${errors.nombre ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.nombre && (
                                        <span className={styles.errorMessage}>{errors.nombre}</span>
                                    )}
                                </div>
                            </div>

                            {/* Tipo de dispositivo */}
                            <div className={styles.formGroup}>
                                <label htmlFor="tipo" className={styles.formLabel}>
                                    Tipo de dispositivo*
                                    <span className={styles.labelSubtext}>Categoría del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <Dropdown
                                        id="tipo"
                                        value={formData.tipo}
                                        onChange={(e) => handleInputChange('tipo', e.value)}
                                        options={tiposDispositivo.length > 0 ? tiposDispositivo : TIPOS_DISPOSITIVO_DEFAULT}
                                        placeholder="Selecciona un tipo"
                                        className={`${styles.formSelect} ${errors.tipo ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.tipo && (
                                        <span className={styles.errorMessage}>{errors.tipo}</span>
                                    )}
                                </div>
                            </div>

                            {/* Identificador único */}
                            <div className={styles.formGroup}>
                                <label htmlFor="identificador_unico" className={styles.formLabel}>
                                    Identificador único*
                                    <span className={styles.labelSubtext}>ID para identificación del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputText
                                        id="identificador_unico"
                                        value={formData.identificador_unico}
                                        onChange={(e) => handleInputChange('identificador_unico', e.target.value)}
                                        placeholder="Ej: ESP32-SALA-001"
                                        className={`${styles.formInput} ${errors.identificador_unico ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.identificador_unico && (
                                        <span className={styles.errorMessage}>{errors.identificador_unico}</span>
                                    )}
                                </div>
                            </div>

                            {/* Estado */}
                            <div className={styles.formGroup}>
                                <label htmlFor="estado" className={styles.formLabel}>
                                    Estado inicial
                                    <span className={styles.labelSubtext}>Estado del dispositivo al crearlo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <Dropdown
                                        id="estado"
                                        value={formData.estado}
                                        onChange={(e) => handleInputChange('estado', e.value)}
                                        options={ESTADOS}
                                        className={styles.formSelect}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className={styles.formGroup}>
                                <label htmlFor="ubicacion" className={styles.formLabel}>
                                    Ubicación*
                                    <span className={styles.labelSubtext}>Ubicación física del dispositivo</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputText
                                        id="ubicacion"
                                        value={formData.ubicacion}
                                        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                        placeholder="Ej: Invernadero 1, Sector A"
                                        className={`${styles.formInput} ${errors.ubicacion ? styles.inputError : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.ubicacion && (
                                        <span className={styles.errorMessage}>{errors.ubicacion}</span>
                                    )}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className={styles.formGroup}>
                                <label htmlFor="descripcion" className={styles.formLabel}>
                                    Descripción
                                    <span className={styles.labelSubtext}>Información adicional (opcional)</span>
                                </label>
                                <div className={styles.formInputWrapper}>
                                    <InputTextarea
                                        id="descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                        placeholder="Información adicional sobre el dispositivo..."
                                        rows={4}
                                        className={styles.formTextarea}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className={styles.btnSecondary}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={styles.btnPrimary}
                                disabled={loading}
                            >
                                <SaveIcon className={styles.btnIcon} />
                                <span>{loading ? 'Guardando...' : 'Guardar dispositivo'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Panel de vista previa */}
                    <div className={styles.previewPanel}>
                        <div className={styles.previewCard}>
                            <div className={styles.deviceAvatar}>
                                <DevicesIcon style={{ fontSize: '48px', color: 'white' }} />
                            </div>
                            
                            <div className={styles.previewLabel}>DISPOSITIVO</div>
                            <h3 className={styles.previewTitle}>
                                {formData.nombre || 'Nuevo Dispositivo'}
                            </h3>

                            <div className={styles.previewInfo}>
                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>Tipo:</span>
                                    <span className={styles.previewValue}>
                                        {formData.tipo ? (tiposDispositivo.find(t => t.value === formData.tipo)?.label || formData.tipo) : 'No especificado'}
                                    </span>
                                </div>

                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>Identificador:</span>
                                    <span className={styles.previewValue}>
                                        {formData.identificador_unico || 'No especificado'}
                                    </span>
                                </div>

                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>Ubicación:</span>
                                    <span className={styles.previewValue}>
                                        {formData.ubicacion || 'No especificado'}
                                    </span>
                                </div>

                                <div className={styles.previewItem}>
                                    <span className={styles.previewKey}>Estado:</span>
                                    <span className={styles.previewValue}>
                                        {ESTADOS.find(e => e.value === formData.estado)?.label || 'Activo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
