'use client'

import React, { useEffect, useState } from 'react'

import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import { DispositivoMapMarker, calcularBoundsDelMapa } from '@/app/services/dispositivos-map.types'

import styles from './DispositivosMap.module.css'

// Fix para iconos de Leaflet en Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/images/marker-icon-2x.png',
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
    })
}

// Iconos personalizados para dispositivos
const crearIconoDispositivo = (estado: 'activo' | 'inactivo') => {
    const color = estado === 'activo' ? '#10b981' : '#ef4444'
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            ">
                📡
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    })
}

interface DispositivosMapProps {
    dispositivos: DispositivoMapMarker[]
    height?: string
    centerOnDevices?: boolean
    onDeviceClick?: (dispositivoId: number) => void
}

// Componente auxiliar para ajustar el mapa a los bounds
const MapBoundsController: React.FC<{ markers: DispositivoMapMarker[] }> = ({ markers }) => {
    const map = useMap()

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = calcularBoundsDelMapa(markers)
            if (bounds) {
                map.fitBounds([
                    [bounds.minLat, bounds.minLng],
                    [bounds.maxLat, bounds.maxLng]
                ], { padding: [50, 50], maxZoom: 15 })
            }
        }
    }, [markers, map])

    return null
}

export const DispositivosMap: React.FC<DispositivosMapProps> = ({
    dispositivos,
    height = '600px',
    centerOnDevices = true,
    onDeviceClick
}) => {
    const [mounted, setMounted] = useState(false)

    // Asegurar que solo se renderice en el cliente
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className={styles.mapPlaceholder} style={{ height }}>
                <div className={styles.loadingMap}>
                    <div className={styles.spinner}></div>
                    <p>Cargando mapa...</p>
                </div>
            </div>
        )
    }

    // Centro predeterminado (Colombia)
    const defaultCenter: [number, number] = [4.60971, -74.08175]
    const defaultZoom = 6

    return (
        <div className={styles.mapWrapper} style={{ height }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className={styles.mapContainer}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {centerOnDevices && dispositivos.length > 0 && (
                    <MapBoundsController markers={dispositivos} />
                )}

                {dispositivos.map((dispositivo) => (
                    <Marker
                        key={dispositivo.id}
                        position={[dispositivo.latitud, dispositivo.longitud]}
                        icon={crearIconoDispositivo(dispositivo.estado)}
                        eventHandlers={{
                            click: () => onDeviceClick?.(dispositivo.id)
                        }}
                    >
                        <Popup className={styles.customPopup}>
                            <div className={styles.popupContent}>
                                <h3 className={styles.popupTitle}>
                                    📡 {dispositivo.nombre}
                                </h3>
                                
                                <div className={styles.popupInfo}>
                                    <div className={styles.infoRow}>
                                        <strong>Estado:</strong>
                                        <span className={
                                            dispositivo.estado === 'activo' 
                                                ? styles.estadoActivo 
                                                : styles.estadoInactivo
                                        }>
                                            {dispositivo.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                                        </span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <strong>Tipo:</strong>
                                        <span>{dispositivo.tipo}</span>
                                    </div>

                                    {dispositivo.ubicacion && (
                                        <div className={styles.infoRow}>
                                            <strong>Ubicación:</strong>
                                            <span>{dispositivo.ubicacion}</span>
                                        </div>
                                    )}

                                    {dispositivo.ultimaLectura && (
                                        <div className={styles.lecturaSection}>
                                            <strong>Última lectura:</strong>
                                            <div className={styles.lecturaValor}>
                                                {dispositivo.ultimaLectura.valor} {dispositivo.ultimaLectura.unidad}
                                            </div>
                                            <div className={styles.lecturaFecha}>
                                                {new Date(dispositivo.ultimaLectura.fecha).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {dispositivo.propietario && (
                                        <div className={styles.propietarioSection}>
                                            <strong>Propietario:</strong>
                                            <div>{dispositivo.propietario.nombre}</div>
                                            <div className={styles.email}>{dispositivo.propietario.email}</div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    className={styles.verDetallesBtn}
                                    onClick={() => onDeviceClick?.(dispositivo.id)}
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {dispositivos.length === 0 && (
                <div className={styles.noDevicesOverlay}>
                    <div className={styles.noDevicesMessage}>
                        <span className={styles.noDevicesIcon}>📍</span>
                        <p>No hay dispositivos con ubicación registrada</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DispositivosMap
