'use client'

import { useState } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'
import { Slider } from 'primereact/slider'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import TuneIcon from '@mui/icons-material/Tune'
import SensorsIcon from '@mui/icons-material/Sensors'
import styles from './MqttControls.module.css'

interface MqttControlsProps {
    deviceId: string
}

export function MqttControls({ deviceId }: MqttControlsProps) {
    const { ledOn, ledOff, ledToggle, dimmerSet, readSensors, loading } = useMqttCommands()
    const [ledState, setLedState] = useState(false)
    const [dimmerValue, setDimmerValue] = useState(50)

    const handleLedToggle = async () => {
        await ledToggle(deviceId)
        setLedState(!ledState)
    }

    const handleLedOn = async () => {
        await ledOn(deviceId)
        setLedState(true)
    }

    const handleLedOff = async () => {
        await ledOff(deviceId)
        setLedState(false)
    }

    const handleDimmerChange = async (value: number) => {
        setDimmerValue(value)
        await dimmerSet(deviceId, value)
    }

    const handleReadSensors = async () => {
        await readSensors(deviceId)
    }

    return (
        <div className={styles.container}>
            {/* Control de LED */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <LightbulbIcon className={styles.sectionIcon} />
                    <h4>Control de LED</h4>
                </div>
                <div className={styles.ledControl}>
                    <div className={styles.ledVisual}>
                        <div className={`${styles.ledBulb} ${ledState ? styles.ledOn : styles.ledOff}`}>
                            <LightbulbIcon className={styles.bulbIcon} />
                        </div>
                        <span className={styles.ledStatus}>
                            {ledState ? 'Encendido' : 'Apagado'}
                        </span>
                    </div>
                    <div className={styles.ledButtons}>
                        <button
                            onClick={handleLedOn}
                            disabled={loading}
                            className={`${styles.ledButton} ${styles.ledOnButton}`}
                        >
                            Encender
                        </button>
                        <button
                            onClick={handleLedOff}
                            disabled={loading}
                            className={`${styles.ledButton} ${styles.ledOffButton}`}
                        >
                            Apagar
                        </button>
                        <button
                            onClick={handleLedToggle}
                            disabled={loading}
                            className={`${styles.ledButton} ${styles.ledToggleButton}`}
                        >
                            Toggle
                        </button>
                    </div>
                </div>
            </div>

            {/* Control de Dimmer */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <TuneIcon className={styles.sectionIcon} />
                    <h4>Dimmer</h4>
                </div>
                <div className={styles.dimmerControl}>
                    <div className={styles.dimmerDisplay}>
                        <span className={styles.dimmerValue}>{dimmerValue}%</span>
                        <div className={styles.dimmerBar}>
                            <div 
                                className={styles.dimmerFill} 
                                style={{ width: `${dimmerValue}%` }}
                            />
                        </div>
                    </div>
                    <div className={styles.sliderContainer}>
                        <Slider
                            value={dimmerValue}
                            onChange={(e) => handleDimmerChange(e.value as number)}
                            className={styles.slider}
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.dimmerPresets}>
                        <button
                            onClick={() => handleDimmerChange(0)}
                            disabled={loading}
                            className={styles.presetButton}
                        >
                            0%
                        </button>
                        <button
                            onClick={() => handleDimmerChange(25)}
                            disabled={loading}
                            className={styles.presetButton}
                        >
                            25%
                        </button>
                        <button
                            onClick={() => handleDimmerChange(50)}
                            disabled={loading}
                            className={styles.presetButton}
                        >
                            50%
                        </button>
                        <button
                            onClick={() => handleDimmerChange(75)}
                            disabled={loading}
                            className={styles.presetButton}
                        >
                            75%
                        </button>
                        <button
                            onClick={() => handleDimmerChange(100)}
                            disabled={loading}
                            className={styles.presetButton}
                        >
                            100%
                        </button>
                    </div>
                </div>
            </div>

            {/* Leer Sensores */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <SensorsIcon className={styles.sectionIcon} />
                    <h4>Sensores</h4>
                </div>
                <div className={styles.sensorControl}>
                    <p className={styles.sensorDescription}>
                        Solicitar lectura de todos los sensores del dispositivo
                    </p>
                    <button
                        onClick={handleReadSensors}
                        disabled={loading}
                        className={styles.sensorButton}
                    >
                        <SensorsIcon />
                        Leer Sensores
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MqttControls
