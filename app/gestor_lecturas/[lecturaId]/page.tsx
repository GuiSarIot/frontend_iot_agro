'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import SensorsIcon from '@mui/icons-material/Sensors'
import { Button } from 'primereact/button'
import { Chip } from 'primereact/chip'
import { InputTextarea } from 'primereact/inputtextarea'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import {
    lecturasService,
    type Lectura,
    type UpdateLecturaDto
} from '@/app/services/api.service'
import { isSuperUser as checkIsSuperUser } from '@/app/utils/permissions'
import { useAppContext } from '@/context/appContext'

import stylesPage from '../mainPage.module.css'

interface LecturaDetailPageProps {
    params: {
        lecturaId: string
    }
}

const LecturaDetailPage = ({ params }: LecturaDetailPageProps) => {
    const router = useRouter()
    const { changeTitle, showNavbar, showLoader, appState } = useAppContext()
    const { userInfo } = appState

    const lecturaId = parseInt(params.lecturaId)

    // Registrar acceso
    useAccessLogger({
        customModule: 'readings',
        action: 'view'
    })

    // ---- Estados ----
    const [lectura, setLectura] = useState<Lectura | null>(null)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [metadata, setMetadata] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Determinar si el usuario es superusuario
    const isSuperUser = userInfo ? checkIsSuperUser(userInfo) : false

    // ---- Efectos ----
    useEffect(() => {
        changeTitle('Detalle de lectura')
        showNavbar(true)
        
        const loadLectura = async () => {
            try {
                setLoading(true)
                showLoader(true)

                const data = await lecturasService.getById(lecturaId)
                setLectura(data)
                setMetadata(JSON.stringify(data.metadata_json, null, 2))
            } catch (error) {
                console.error('Error cargando lectura:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar la lectura'
                }).then(() => {
                    router.push('/gestor_lecturas')
                })
            } finally {
                setLoading(false)
                showLoader(false)
            }
        }
        
        loadLectura()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lecturaId])

    // ---- Validación ----
    const validateMetadata = (): boolean => {
        if (metadata.trim()) {
            try {
                JSON.parse(metadata)
                return true
            } catch {
                setErrors({ metadata: 'El formato JSON no es válido' })
                return false
            }
        }
        return true
    }

    // ---- Handlers ----
    const handleUpdate = async () => {
        if (!validateMetadata()) {
            Swal.fire({
                icon: 'warning',
                title: 'JSON inválido',
                text: 'Por favor, corrija el formato del JSON'
            })
            return
        }

        try {
            showLoader(true)

            const updateData: UpdateLecturaDto = {
                metadata_json: metadata.trim() ? JSON.parse(metadata) : {}
            }

            const updated = await lecturasService.update(lecturaId, updateData)
            setLectura(updated)
            setEditMode(false)

            Swal.fire({
                icon: 'success',
                title: 'Actualizada',
                text: 'La lectura ha sido actualizada correctamente',
                timer: 2000
            })
        } catch (error) {
            console.error('Error actualizando lectura:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la lectura'
            })
        } finally {
            showLoader(false)
        }
    }

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar lectura?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (result.isConfirmed) {
            try {
                showLoader(true)
                await lecturasService.delete(lecturaId)

                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La lectura ha sido eliminada correctamente',
                    timer: 2000
                })

                router.push('/gestor_lecturas')
            } catch (error) {
                console.error('Error eliminando lectura:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la lectura'
                })
            } finally {
                showLoader(false)
            }
        }
    }

    const cancelEdit = () => {
        if (lectura) {
            setMetadata(JSON.stringify(lectura.metadata_json, null, 2))
        }
        setEditMode(false)
        setErrors({})
    }

    // ---- Render ----
    if (loading || !lectura) {
        return (
            <div className={stylesPage.containerPage}>
                <div className={stylesPage.mainCard}>
                    <div className={stylesPage.emptyState}>
                        <p>Cargando...</p>
                    </div>
                </div>
            </div>
        )
    }

    const fecha = new Date(lectura.timestamp)
    const fechaFormateada = fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })

    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.titleSection}>
                        <div className={stylesPage.titleWrapper}>
                            <SensorsIcon className={stylesPage.titleIcon} />
                            <h1 className={stylesPage.pageTitle}>Detalle de lectura #{lectura.id}</h1>
                        </div>
                        <p className={stylesPage.pageSubtitle}>
                            Información completa de la lectura capturada
                        </p>

                        <div className={stylesPage.headerActions}>
                            <Button
                                icon={<ArrowBackIcon />}
                                label="Volver"
                                severity="secondary"
                                outlined
                                onClick={() => router.push('/gestor_lecturas')}
                            />

                            {isSuperUser && !editMode && (
                                <Button
                                    icon={<EditIcon />}
                                    label="Editar metadata"
                                    severity="info"
                                    onClick={() => setEditMode(true)}
                                />
                            )}

                            {isSuperUser && (
                                <Button
                                    icon={<DeleteIcon />}
                                    label="Eliminar"
                                    severity="danger"
                                    onClick={handleDelete}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Información principal */}
                <div className={stylesPage.tableSection}>
                    <div className={stylesPage.detailCard}>
                        <h2 className={stylesPage.detailCardTitle}>Información de la lectura</h2>

                        <div className={stylesPage.detailGrid}>
                            <div className={stylesPage.detailItem}>
                                <span className={stylesPage.detailLabel}>ID</span>
                                <span className={stylesPage.detailValue}>{lectura.id}</span>
                            </div>

                            <div className={stylesPage.detailItem}>
                                <span className={stylesPage.detailLabel}>Fecha y hora</span>
                                <span className={stylesPage.detailValue}>{fechaFormateada}</span>
                            </div>

                            <div className={stylesPage.detailItem}>
                                <span className={stylesPage.detailLabel}>Dispositivo</span>
                                <span className={stylesPage.detailValue}>{lectura.dispositivo_nombre}</span>
                            </div>

                            <div className={stylesPage.detailItem}>
                                <span className={stylesPage.detailLabel}>Sensor</span>
                                <span className={stylesPage.detailValue}>{lectura.sensor_nombre}</span>
                            </div>

                            <div className={stylesPage.detailItem}>
                                <span className={stylesPage.detailLabel}>Valor</span>
                                <span className={stylesPage.detailValue} style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--primary)' }}>
                                    {lectura.valor} {lectura.sensor_unidad}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información MQTT (si existe) */}
                    {(lectura.mqtt_message_id || lectura.mqtt_qos !== undefined) && (
                        <div className={stylesPage.detailCard}>
                            <h2 className={stylesPage.detailCardTitle}>Información MQTT</h2>

                            <div className={stylesPage.detailGrid}>
                                {lectura.mqtt_message_id && (
                                    <div className={stylesPage.detailItem}>
                                        <span className={stylesPage.detailLabel}>Message ID</span>
                                        <span className={stylesPage.detailValue}>{lectura.mqtt_message_id}</span>
                                    </div>
                                )}

                                {lectura.mqtt_qos !== undefined && (
                                    <div className={stylesPage.detailItem}>
                                        <span className={stylesPage.detailLabel}>QoS</span>
                                        <span className={stylesPage.detailValue}>{lectura.mqtt_qos}</span>
                                    </div>
                                )}

                                {lectura.mqtt_retained !== undefined && (
                                    <div className={stylesPage.detailItem}>
                                        <span className={stylesPage.detailLabel}>Retained</span>
                                        <span className={stylesPage.detailValue}>
                                            <Chip
                                                label={lectura.mqtt_retained ? 'Sí' : 'No'}
                                                className={lectura.mqtt_retained ? stylesPage.badgeSuccess : stylesPage.badgeWarning}
                                            />
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className={stylesPage.detailCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            <h2 className={stylesPage.detailCardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Metadata</h2>

                            {editMode && (
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <Button
                                        label="Cancelar"
                                        severity="secondary"
                                        size="small"
                                        outlined
                                        onClick={cancelEdit}
                                    />
                                    <Button
                                        icon={<SaveIcon />}
                                        label="Guardar"
                                        severity="success"
                                        size="small"
                                        onClick={handleUpdate}
                                    />
                                </div>
                            )}
                        </div>

                        {editMode ? (
                            <div className={stylesPage.filterGroup}>
                                <InputTextarea
                                    value={metadata}
                                    onChange={(e) => {
                                        setMetadata(e.target.value)
                                        if (errors.metadata) {
                                            setErrors({})
                                        }
                                    }}
                                    rows={10}
                                    className={errors.metadata ? 'p-invalid' : ''}
                                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                                />
                                {errors.metadata && (
                                    <small style={{ color: '#ef4444' }}>{errors.metadata}</small>
                                )}
                            </div>
                        ) : (
                            <pre style={{
                                background: '#f8f9fa',
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--border-radius-md)',
                                overflow: 'auto',
                                fontSize: '0.875rem',
                                margin: 0,
                                border: '1px solid var(--border-color)'
                            }}>
                                {metadata || '{}'}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LecturaDetailPage
