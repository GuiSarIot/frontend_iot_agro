'use client'

import { useState, useEffect } from 'react'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import CloseIcon from '@mui/icons-material/Close'
import SensorsIcon from '@mui/icons-material/Sensors'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'

import { sensoresService, type Sensor } from '@/app/services/api.service'

import styles from './AsignarSensorModal.module.css'

interface AsignarSensorModalProps {
    visible: boolean
    onHide: () => void
    onAssign: (sensorId: number, config: { intervalo?: number; umbral_alerta?: number }) => void
    loading?: boolean
}

export default function AsignarSensorModal({
    visible,
    onHide,
    onAssign,
    loading = false
}: AsignarSensorModalProps) {
    const [sensores, setSensores] = useState<Sensor[]>([])
    const [loadingSensores, setLoadingSensores] = useState(false)
    const [sensorSeleccionado, setSensorSeleccionado] = useState<number | null>(null)
    const [intervalo, setIntervalo] = useState<number>(60)
    const [umbralAlerta, setUmbralAlerta] = useState<number | null>(null)

    useEffect(() => {
        if (visible) {
            loadSensores()
        }
    }, [visible])

    const loadSensores = async () => {
        setLoadingSensores(true)
        try {
            const data = await sensoresService.getAll()
            setSensores(data.results || [])
        } catch (error) {
            console.error('Error al cargar sensores:', error)
            setSensores([])
        } finally {
            setLoadingSensores(false)
        }
    }

    const handleAssign = () => {
        if (!sensorSeleccionado) return

        const config: { intervalo?: number; umbral_alerta?: number } = {}
        if (intervalo) config.intervalo = intervalo
        if (umbralAlerta !== null) config.umbral_alerta = umbralAlerta

        onAssign(sensorSeleccionado, config)
    }

    const handleClose = () => {
        setSensorSeleccionado(null)
        setIntervalo(60)
        setUmbralAlerta(null)
        onHide()
    }

    const sensoresOptions = sensores.map(s => ({
        label: `${s.nombre} (${s.tipo})`,
        value: s.id
    }))

    const footer = (
        <div className={styles.modalFooter}>
            <Button
                label="Cancelar"
                icon={<CloseIcon style={{ fontSize: '18px', marginRight: '8px' }} />}
                onClick={handleClose}
                className={styles.btnSecondary}
                disabled={loading}
            />
            <Button
                label={loading ? 'Asignando...' : 'Asignar sensor'}
                icon={<AddCircleIcon style={{ fontSize: '18px', marginRight: '8px' }} />}
                onClick={handleAssign}
                className={styles.btnPrimary}
                disabled={!sensorSeleccionado || loading}
            />
        </div>
    )

    const headerTemplate = (
        <div className={styles.modalHeader}>
            <SensorsIcon className={styles.modalHeaderIcon} />
            <span>Asignar sensor al dispositivo</span>
        </div>
    )

    return (
        <Dialog
            visible={visible}
            onHide={handleClose}
            header={headerTemplate}
            footer={footer}
            className={styles.modal}
            style={{ width: '550px', maxWidth: '95vw' }}
            draggable={false}
            resizable={false}
        >
            <div className={styles.modalContent}>
                <p className={styles.modalDescription}>
                    Selecciona un sensor para asignar al dispositivo y configura sus parámetros de lectura.
                </p>

                <div className={styles.formGroup}>
                    <label htmlFor="sensor" className={styles.label}>
                        Sensor*
                        <span className={styles.labelHint}>Selecciona el sensor a asignar</span>
                    </label>
                    <Dropdown
                        id="sensor"
                        value={sensorSeleccionado}
                        onChange={(e) => setSensorSeleccionado(e.value)}
                        options={sensoresOptions}
                        placeholder={loadingSensores ? 'Cargando sensores...' : 'Selecciona un sensor'}
                        className={styles.dropdown}
                        disabled={loadingSensores || loading}
                        filter
                        filterPlaceholder="Buscar sensor..."
                        emptyMessage="No hay sensores disponibles"
                        showClear
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="intervalo" className={styles.label}>
                        Intervalo de lectura (segundos)
                        <span className={styles.labelHint}>Cada cuánto tiempo se leerá el sensor</span>
                    </label>
                    <InputNumber
                        id="intervalo"
                        value={intervalo}
                        onValueChange={(e) => setIntervalo(e.value || 60)}
                        min={1}
                        max={86400}
                        placeholder="60"
                        className={styles.inputNumber}
                        disabled={loading}
                        suffix=" seg"
                        showButtons
                        buttonLayout="horizontal"
                        step={10}
                        decrementButtonClassName="p-button-secondary"
                        incrementButtonClassName="p-button-secondary"
                    />
                    <small className={styles.fieldHelp}>
                        Valor recomendado: 60 segundos. Mínimo: 1 segundo. Máximo: 86400 segundos (24 horas).
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="umbral" className={styles.label}>
                        Umbral de alerta (opcional)
                        <span className={styles.labelHint}>Valor que activará una alerta</span>
                    </label>
                    <InputNumber
                        id="umbral"
                        value={umbralAlerta}
                        onValueChange={(e) => setUmbralAlerta(e.value)}
                        placeholder="Ej: 30"
                        className={styles.inputNumber}
                        disabled={loading}
                        showButtons
                        buttonLayout="horizontal"
                        decrementButtonClassName="p-button-secondary"
                        incrementButtonClassName="p-button-secondary"
                    />
                    <small className={styles.fieldHelp}>
                        Si se especifica, se generará una alerta cuando el valor del sensor supere este umbral.
                    </small>
                </div>
            </div>
        </Dialog>
    )
}
