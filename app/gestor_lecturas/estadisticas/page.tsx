'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AssessmentIcon from '@mui/icons-material/Assessment'
import RefreshIcon from '@mui/icons-material/Refresh'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Button } from 'primereact/button'
import { Chart } from 'primereact/chart'
import { Dropdown } from 'primereact/dropdown'
import Swal from 'sweetalert2'

import { useAccessLogger } from '@/app/hooks/useAccessLogger'
import {
    lecturasService,
    dispositivosService,
    sensoresService,
    type EstadisticasLecturas,
    type LecturaResumida
} from '@/app/services/api.service'
import { useAppContext } from '@/context/appContext'

import stylesPage from '../mainPage.module.css'

const EstadisticasLecturasPage = () => {
    const router = useRouter()
    const { changeTitle, showNavbar, showLoader } = useAppContext()

    // Registrar acceso
    const { logAction } = useAccessLogger({
        customModule: 'readings',
        action: 'statistics'
    })

    // ---- Estados ----
    const [estadisticas, setEstadisticas] = useState<EstadisticasLecturas | null>(null)
    const [ultimasLecturas, setUltimasLecturas] = useState<LecturaResumida[]>([])
    const [dispositivos, setDispositivos] = useState<Array<{ value: number; label: string }>>([])
    const [sensores, setSensores] = useState<Array<{ value: number; label: string }>>([])

    // Filtros
    const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState<number | null>(null)
    const [sensorSeleccionado, setSensorSeleccionado] = useState<number | null>(null)

    // ---- Funciones de carga ----
    const loadDispositivos = async () => {
        try {
            const response = await dispositivosService.getAll()
            const options = response.results.map(d => ({
                value: d.id,
                label: d.nombre
            }))
            setDispositivos(options)
        } catch (error) {
            console.error('Error cargando dispositivos:', error)
        }
    }

    const loadSensores = async () => {
        try {
            const response = await sensoresService.getAll()
            const options = response.results.map(s => ({
                value: s.id,
                label: s.nombre
            }))
            setSensores(options)
        } catch (error) {
            console.error('Error cargando sensores:', error)
        }
    }

    const loadEstadisticas = useCallback(async () => {
        try {
            showLoader(true)

            const params: { dispositivo?: number; sensor?: number } = {}
            if (dispositivoSeleccionado) params.dispositivo = dispositivoSeleccionado
            if (sensorSeleccionado) params.sensor = sensorSeleccionado

            const data = await lecturasService.getEstadisticas(params)
            setEstadisticas(data)
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las estadísticas'
            })
        } finally {
            showLoader(false)
        }
    }, [dispositivoSeleccionado, sensorSeleccionado, showLoader])

    const loadUltimasLecturas = async () => {
        try {
            const data = await lecturasService.getUltimas(20)
            setUltimasLecturas(data)
        } catch (error) {
            console.error('Error cargando últimas lecturas:', error)
        }
    }

    // ---- Efectos ----
    useEffect(() => {
        changeTitle('Estadísticas de lecturas')
        showNavbar(true)
        logAction()

        loadDispositivos()
        loadSensores()
        loadUltimasLecturas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        loadEstadisticas()
    }, [loadEstadisticas])

    // ---- Handlers ----
    const handleRefresh = () => {
        loadEstadisticas()
        loadUltimasLecturas()
    }

    const clearFilters = () => {
        setDispositivoSeleccionado(null)
        setSensorSeleccionado(null)
    }

    // ---- Datos del gráfico ----
    const chartData = estadisticas ? {
        labels: ['Total', 'Promedio', 'Máximo', 'Mínimo', 'MQTT'],
        datasets: [
            {
                label: 'Estadísticas',
                data: [
                    estadisticas.total,
                    estadisticas.promedio,
                    estadisticas.maximo,
                    estadisticas.minimo,
                    estadisticas.lecturas_mqtt
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }
        ]
    } : null

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Distribución de estadísticas'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }

    // ---- Render ----
    return (
        <div className={stylesPage.containerPage}>
            <div className={stylesPage.mainCard}>
                {/* Header */}
                <div className={stylesPage.pageHeader}>
                    <div className={stylesPage.headerContent}>
                        <div className={stylesPage.titleSection}>
                            <div className={stylesPage.titleWrapper}>
                                <AssessmentIcon className={stylesPage.titleIcon} />
                                <div>
                                    <h1 className={stylesPage.pageTitle}>Estadísticas de lecturas</h1>
                                    <p className={stylesPage.pageSubtitle}>
                                        Visualiza métricas y análisis de las lecturas registradas en el sistema
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={stylesPage.headerActions}>
                            <Button
                                icon={<RefreshIcon />}
                                label="Actualizar"
                                severity="secondary"
                                outlined
                                onClick={handleRefresh}
                            />

                            <Button
                                icon={<ArrowBackIcon />}
                                label="Volver"
                                severity="secondary"
                                outlined
                                onClick={() => router.push('/gestor_lecturas')}
                            />
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className={stylesPage.filtersSection}>
                    <div className={stylesPage.filtersGrid}>
                        <div className={stylesPage.filterGroup}>
                            <label className={stylesPage.filterLabel}>Dispositivo</label>
                            <Dropdown
                                value={dispositivoSeleccionado}
                                options={dispositivos}
                                onChange={(e) => setDispositivoSeleccionado(e.value)}
                                placeholder="Todos los dispositivos"
                                showClear
                                filter
                            />
                        </div>

                        <div className={stylesPage.filterGroup}>
                            <label className={stylesPage.filterLabel}>Sensor</label>
                            <Dropdown
                                value={sensorSeleccionado}
                                options={sensores}
                                onChange={(e) => setSensorSeleccionado(e.value)}
                                placeholder="Todos los sensores"
                                showClear
                                filter
                            />
                        </div>

                        <div className={stylesPage.filterGroup}>
                            <Button
                                label="Limpiar filtros"
                                onClick={clearFilters}
                                severity="secondary"
                                outlined
                            />
                        </div>
                    </div>
                </div>

                {/* Tarjetas de estadísticas */}
                {estadisticas && (
                    <div className={stylesPage.statsSection}>
                        <div className={stylesPage.statsGrid}>
                            <div className={stylesPage.statsCard}>
                                <div className={stylesPage.statItem}>
                                    <span className={stylesPage.statLabel}>Total de lecturas</span>
                                    <span className={stylesPage.statValue}>
                                        {estadisticas.total?.toLocaleString('es-ES') ?? '0'}
                                    </span>
                                </div>
                            </div>

                            <div className={stylesPage.statsCard}>
                                <div className={stylesPage.statItem}>
                                    <span className={stylesPage.statLabel}>Promedio</span>
                                    <span className={stylesPage.statValue} style={{ color: '#3b82f6' }}>
                                        <ShowChartIcon style={{ fontSize: '1.5rem' }} />
                                        {estadisticas.promedio != null ? estadisticas.promedio.toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className={stylesPage.statsCard}>
                                <div className={stylesPage.statItem}>
                                    <span className={stylesPage.statLabel}>Valor máximo</span>
                                    <span className={stylesPage.statValue} style={{ color: '#ef4444' }}>
                                        <TrendingUpIcon style={{ fontSize: '1.5rem' }} />
                                        {estadisticas.maximo != null ? estadisticas.maximo.toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className={stylesPage.statsCard}>
                                <div className={stylesPage.statItem}>
                                    <span className={stylesPage.statLabel}>Valor mínimo</span>
                                    <span className={stylesPage.statValue} style={{ color: '#f59e0b' }}>
                                        <TrendingDownIcon style={{ fontSize: '1.5rem' }} />
                                        {estadisticas.minimo != null ? estadisticas.minimo.toFixed(2) : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className={stylesPage.statsCard}>
                                <div className={stylesPage.statItem}>
                                    <span className={stylesPage.statLabel}>Lecturas MQTT</span>
                                    <span className={stylesPage.statValue} style={{ color: '#8b5cf6' }}>
                                        {estadisticas.lecturas_mqtt?.toLocaleString('es-ES') ?? '0'}
                                    </span>
                                    <small style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                                        {(estadisticas.total ?? 0) > 0 && estadisticas.lecturas_mqtt != null
                                            ? `${(((estadisticas.lecturas_mqtt ?? 0) / (estadisticas.total ?? 1)) * 100).toFixed(1)}% del total`
                                            : '0%'}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfico y últimas lecturas */}
                <div className={stylesPage.tableSection}>
                    {/* Gráfico */}
                    {chartData && (
                        <div className={stylesPage.detailCard}>
                            <h2 className={stylesPage.detailCardTitle}>Gráfico de estadísticas</h2>
                            <div style={{ height: '400px' }}>
                                <Chart type="bar" data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    )}

                    {/* Últimas lecturas */}
                    <div className={stylesPage.detailCard}>
                        <h2 className={stylesPage.detailCardTitle}>Últimas 20 lecturas</h2>
                        
                        {ultimasLecturas.length > 0 ? (
                            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                                {ultimasLecturas.map((lectura) => {
                                    const fecha = new Date(lectura.timestamp)
                                    return (
                                        <div
                                            key={lectura.id}
                                            style={{
                                                background: '#f8f9fa',
                                                padding: 'var(--spacing-lg)',
                                                borderRadius: 'var(--border-radius-md)',
                                                display: 'grid',
                                                gridTemplateColumns: 'auto 1fr auto auto',
                                                gap: 'var(--spacing-lg)',
                                                alignItems: 'center',
                                                border: '1px solid var(--border-color)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                                e.currentTarget.style.transform = 'translateY(-2px)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = 'none'
                                                e.currentTarget.style.transform = 'translateY(0)'
                                            }}
                                        >
                                            <span style={{ fontWeight: '700', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                #{lectura.id}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{lectura.dispositivo_nombre}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    {lectura.sensor_nombre}
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: '700', fontSize: 'var(--font-size-xl)', color: 'var(--primary)' }}>
                                                {lectura.valor}
                                            </span>
                                            <div style={{ textAlign: 'right', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                {fecha.toLocaleDateString('es-ES')}<br />
                                                {fecha.toLocaleTimeString('es-ES')}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className={stylesPage.emptyState}>
                                <p className={stylesPage.emptyText}>No hay lecturas disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EstadisticasLecturasPage
