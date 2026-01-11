'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import SaveIcon from '@mui/icons-material/Save'
import SensorsIcon from '@mui/icons-material/Sensors'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import {
    lecturasService,
    dispositivosService,
    sensoresService,
    type CreateLecturaDto,
    type Dispositivo,
    type Sensor
} from '@/app/services/api.service'
import { isSuperUser as checkIsSuperUser } from '@/app/utils/permissions'
import { useAppContext } from '@/context/appContext'

import styles from './createLectura.module.css'

const CreateLecturaPage = () => {
    const router = useRouter()
    const { changeTitle, showNavbar, showLoader, appState } = useAppContext()
    const { userInfo } = appState

    // Determinar si el usuario es superusuario
    const isSuperUser = checkIsSuperUser(userInfo)

    // Verificar permisos al montar el componente
    useEffect(() => {
        if (!isSuperUser) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'Solo los superusuarios pueden crear lecturas manualmente',
                confirmButtonText: 'Entendido'
            }).then(() => {
                router.push('/gestor_lecturas')
            })
        }
    }, [isSuperUser, router])

    // Registrar acceso automáticamente
    useAccessLogger({
        customModule: 'readings',
        action: 'create'
    })

    // ---- Estados ----
    const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
    const [sensores, setSensores] = useState<Sensor[]>([])
    const [sensoresDisponibles, setSensoresDisponibles] = useState<Sensor[]>([])
    const [loading, setLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const [formData, setFormData] = useState<CreateLecturaDto>({
        dispositivo: 0,
        sensor: 0,
        valor: 0,
        metadata_json: {}
    })

    const [metadata, setMetadata] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // ---- Funciones de carga ----
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

    const loadSensores = useCallback(async () => {
        try {
            showLoader(true)
            const response = await sensoresService.getAll()
            setSensores(response.results)
        } catch (error) {
            console.error('Error cargando sensores:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los sensores'
            })
        } finally {
            showLoader(false)
        }
    }, [showLoader])

    const filterSensoresPorDispositivo = useCallback((dispositivoId: number) => {
        const dispositivo = dispositivos.find(d => d.id === dispositivoId)
        if (!dispositivo || !dispositivo.sensores_asignados) {
            setSensoresDisponibles([])
            return
        }

        // Obtener IDs de sensores asignados al dispositivo
        const sensorIdsAsignados = dispositivo.sensores_asignados.map(sa => sa.sensor)
        
        // Filtrar sensores disponibles
        const sensoresFiltrados = sensores.filter(s => sensorIdsAsignados.includes(s.id))
        setSensoresDisponibles(sensoresFiltrados)
    }, [dispositivos, sensores])

    // ---- Efectos ----
    useEffect(() => {
        if (!isInitialized) {
            changeTitle('Nueva lectura')
            showNavbar(true)
            loadDispositivos()
            loadSensores()
            setIsInitialized(true)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (formData.dispositivo) {
            filterSensoresPorDispositivo(formData.dispositivo)
        } else {
            setSensoresDisponibles([])
        }
    }, [formData.dispositivo, filterSensoresPorDispositivo])

    // ---- Validación ----
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.dispositivo) {
            newErrors.dispositivo = 'Debe seleccionar un dispositivo'
        }

        if (!formData.sensor) {
            newErrors.sensor = 'Debe seleccionar un sensor'
        }

        if (formData.valor === 0 || formData.valor === null) {
            newErrors.valor = 'Debe ingresar un valor'
        }

        // Validar metadata JSON si se ingresó
        if (metadata.trim()) {
            try {
                JSON.parse(metadata)
            } catch {
                newErrors.metadata = 'El formato JSON de metadata no es válido'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ---- Handlers ----
    const handleInputChange = (field: keyof CreateLecturaDto, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleMetadataChange = (value: string) => {
        setMetadata(value)
        
        // Intentar parsear JSON en tiempo real
        if (value.trim()) {
            try {
                const parsed = JSON.parse(value)
                setFormData(prev => ({
                    ...prev,
                    metadata_json: parsed
                }))
                
                // Limpiar error si el JSON es válido
                if (errors.metadata) {
                    setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.metadata
                        return newErrors
                    })
                }
            } catch {
                // No hacer nada mientras se está escribiendo
            }
        } else {
            setFormData(prev => ({
                ...prev,
                metadata_json: {}
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Formulario incompleto',
                text: 'Por favor, complete todos los campos requeridos'
            })
            return
        }

        try {
            setLoading(true)
            showLoader(true)

            await lecturasService.create(formData)

            Swal.fire({
                icon: 'success',
                title: 'Lectura creada',
                text: 'La lectura ha sido registrada correctamente',
                timer: 2000
            })

            router.push('/gestor_lecturas')
        } catch (error: unknown) {
            console.error('Error creando lectura:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la lectura'
            })
        } finally {
            setLoading(false)
            showLoader(false)
        }
    }

    // ---- Opciones de dropdowns ----
    const dispositivosOptions = dispositivos.map(d => ({
        value: d.id,
        label: d.nombre
    }))

    const sensoresOptions = sensoresDisponibles.map(s => ({
        value: s.id,
        label: `${s.nombre} (${s.unidad_medida})`
    }))

    const sensorSeleccionado = sensoresDisponibles.find(s => s.id === formData.sensor)
    const dispositivoSeleccionado = dispositivos.find(d => d.id === formData.dispositivo)

    // ---- Render ----
    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Formulario */}
            <div className={styles.formPanel}>
                <h2 className={styles.sectionTitle}>Nueva lectura manual</h2>
                <p className={styles.sectionDescription}>
                    Registra manualmente una lectura de sensor para un dispositivo específico.
                    Los datos se almacenarán en el sistema para su análisis posterior.
                </p>

                <form className={styles.createForm} onSubmit={handleSubmit}>
                    {/* Dispositivo */}
                    <div className={styles.formGroup}>
                        <label htmlFor="dispositivo" className={styles.formLabel}>
                            Dispositivo*
                            <span className={styles.labelSubtext}>Seleccione el dispositivo origen</span>
                        </label>
                        <Dropdown
                            inputId="dispositivo"
                            value={formData.dispositivo}
                            options={dispositivosOptions}
                            onChange={(e) => handleInputChange('dispositivo', e.value)}
                            placeholder="Seleccione un dispositivo"
                            filter
                            className={errors.dispositivo ? 'p-invalid' : ''}
                        />
                        {errors.dispositivo && (
                            <small className={styles.errorMessage}>{errors.dispositivo}</small>
                        )}
                    </div>

                    {/* Sensor */}
                    <div className={styles.formGroup}>
                        <label htmlFor="sensor" className={styles.formLabel}>
                            Sensor*
                            <span className={styles.labelSubtext}>Sensor asignado al dispositivo</span>
                        </label>
                        <Dropdown
                            inputId="sensor"
                            value={formData.sensor}
                            options={sensoresOptions}
                            onChange={(e) => handleInputChange('sensor', e.value)}
                            placeholder="Seleccione un sensor"
                            filter
                            disabled={!formData.dispositivo || sensoresDisponibles.length === 0}
                            className={errors.sensor ? 'p-invalid' : ''}
                        />
                        {errors.sensor && (
                            <small className={styles.errorMessage}>{errors.sensor}</small>
                        )}
                        {formData.dispositivo && sensoresDisponibles.length === 0 && (
                            <small className={styles.warningMessage}>
                                Este dispositivo no tiene sensores asignados
                            </small>
                        )}
                    </div>

                    {/* Valor */}
                    <div className={styles.formGroup}>
                        <label htmlFor="valor" className={styles.formLabel}>
                            Valor de lectura*
                            <span className={styles.labelSubtext}>
                                {sensorSeleccionado 
                                    ? `Unidad: ${sensorSeleccionado.unidad_medida}`
                                    : 'Valor de la medición'}
                            </span>
                        </label>
                        <InputNumber
                            inputId="valor"
                            value={formData.valor}
                            onValueChange={(e) => handleInputChange('valor', e.value)}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            placeholder="Ingrese el valor"
                            className={errors.valor ? 'p-invalid' : ''}
                            disabled={!formData.sensor}
                        />
                        {errors.valor && (
                            <small className={styles.errorMessage}>{errors.valor}</small>
                        )}
                        {sensorSeleccionado && sensorSeleccionado.rango_min !== undefined && sensorSeleccionado.rango_max !== undefined && (
                            <small className={styles.helperText}>
                                Rango válido: {sensorSeleccionado.rango_min} - {sensorSeleccionado.rango_max} {sensorSeleccionado.unidad_medida}
                            </small>
                        )}
                    </div>

                    {/* Separador - Información adicional */}
                    <div className={styles.sectionDivider}>
                        <h3 className={styles.sectionSubtitle}>Información adicional</h3>
                    </div>

                    {/* Metadata JSON */}
                    <div className={styles.formGroup}>
                        <label htmlFor="metadata" className={styles.formLabel}>
                            Metadata (JSON)
                            <span className={styles.labelSubtext}>Datos adicionales opcionales</span>
                        </label>
                        <InputTextarea
                            id="metadata"
                            value={metadata}
                            onChange={(e) => handleMetadataChange(e.target.value)}
                            rows={5}
                            placeholder='{"calidad": "buena", "bateria": 85, "nota": "Lectura manual"}'
                            className={errors.metadata ? 'p-invalid' : ''}
                        />
                        {errors.metadata && (
                            <small className={styles.errorMessage}>{errors.metadata}</small>
                        )}
                        <small className={styles.helperText}>
                            Formato JSON: {'{'}'"clave": "valor", "numero": 123{'}'}
                        </small>
                    </div>

                    {/* Botones */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => router.push('/gestor_lecturas')}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            <SaveIcon style={{ width: 20, height: 20 }} />
                            {loading ? 'Guardando...' : 'Guardar lectura'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Panel derecho - Preview de la lectura */}
            <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                    <div className={styles.iconContainer}>
                        <SensorsIcon />
                    </div>
                    <div className={styles.statusBadge}>
                        Nueva Lectura
                    </div>
                </div>

                <div className={styles.previewInfo}>
                    <h3 className={styles.previewTitle}>
                        {sensorSeleccionado?.nombre || 'Lectura Manual'}
                    </h3>
                    <p className={styles.previewSubtitle}>
                        {dispositivoSeleccionado?.nombre || 'Seleccione un dispositivo'}
                    </p>

                    {formData.dispositivo && formData.sensor && formData.valor !== null && formData.valor !== 0 ? (
                        <div className={styles.previewDetails}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Valor:</span>
                                <span className={styles.detailValueHighlight}>
                                    {formData.valor} {sensorSeleccionado?.unidad_medida}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Dispositivo:</span>
                                <span className={styles.detailValue}>
                                    {dispositivoSeleccionado?.nombre}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Sensor:</span>
                                <span className={styles.detailValue}>
                                    {sensorSeleccionado?.nombre}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Tipo:</span>
                                <span className={styles.detailValue}>
                                    {sensorSeleccionado?.tipo || 'No especificado'}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Unidad de medida:</span>
                                <span className={styles.detailValue}>
                                    {sensorSeleccionado?.unidad_medida}
                                </span>
                            </div>
                            {sensorSeleccionado && sensorSeleccionado.rango_min !== undefined && sensorSeleccionado.rango_max !== undefined && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Rango permitido:</span>
                                    <span className={styles.detailValue}>
                                        {sensorSeleccionado.rango_min} - {sensorSeleccionado.rango_max}
                                    </span>
                                </div>
                            )}
                            {metadata.trim() && !errors.metadata && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Metadata adicional:</span>
                                    <span className={styles.detailValue} style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                        Datos JSON incluidos
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <SensorsIcon />
                            <p>Complete el formulario para ver un resumen de la lectura</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateLecturaPage
