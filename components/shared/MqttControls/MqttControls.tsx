'use client'

import { useState } from 'react'
import { useMqttCommands } from '@/app/hooks/useMqttCommands'
import { Slider } from 'primereact/slider'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import TuneIcon from '@mui/icons-material/Tune'
import SensorsIcon from '@mui/icons-material/Sensors'
import PowerIcon from '@mui/icons-material/Power'
import PowerOffIcon from '@mui/icons-material/PowerOff'
import styles from './MqttControls.module.css'

interface MqttControlsProps {
    deviceId: string
}

export function MqttControls({ deviceId }: MqttControlsProps) {
    const { 
        ledOn, 
        ledOff, 
        ledToggle, 
        dimmerSet, 
        readSensors, 
        relay1On,
        relay1Off,
        relay2On,
        relay2Off,
        relayBothOn,
        relayBothOff,
        loading 
    } = useMqttCommands()
    const [ledState, setLedState] = useState(false)
    const [dimmerValue, setDimmerValue] = useState(50)
    const [relay1State, setRelay1State] = useState(false)
    const [relay2State, setRelay2State] = useState(false)

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

    // Handlers para Relay 1
    const handleRelay1On = async () => {
        await relay1On(deviceId)
        setRelay1State(true)
    }

    const handleRelay1Off = async () => {
        await relay1Off(deviceId)
        setRelay1State(false)
    }

    // Handlers para Relay 2
    const handleRelay2On = async () => {
        await relay2On(deviceId)
        setRelay2State(true)
    }

    const handleRelay2Off = async () => {
        await relay2Off(deviceId)
        setRelay2State(false)
    }

    // Handlers para ambos relays
    const handleRelayBothOn = async () => {
        await relayBothOn(deviceId)
        setRelay1State(true)
        setRelay2State(true)
    }

    const handleRelayBothOff = async () => {
        await relayBothOff(deviceId)
        setRelay1State(false)
        setRelay2State(false)
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

            {/* Control de Relays */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <PowerIcon className={styles.sectionIcon} />
                    <h4>Control de Relays</h4>
                </div>
                
                {/* Relay 1 */}
                <div className={styles.relayControl}>
                    <div className={styles.relayHeader}>
                        <span className={styles.relayLabel}>Relay 1 (GPIO17)</span>
                        <span className={`${styles.relayStatus} ${relay1State ? styles.relayOn : styles.relayOff}`}>
                            {relay1State ? '● ON' : '○ OFF'}
                        </span>
                    </div>
                    <div className={styles.relayButtons}>
                        <button
                            onClick={handleRelay1On}
                            disabled={loading}
                            className={`${styles.relayButton} ${styles.relayOnButton}`}
                        >
                            <PowerIcon />
                            Encender
                        </button>
                        <button
                            onClick={handleRelay1Off}
                            disabled={loading}
                            className={`${styles.relayButton} ${styles.relayOffButton}`}
                        >
                            <PowerOffIcon />
                            Apagar
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
