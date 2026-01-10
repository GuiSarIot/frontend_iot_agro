'use client'

import { useState } from 'react'

import { accessLogsService } from '@/app/services/api.service'

export default function TestAccessLoggerPage() {
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testLog = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const data = {
                module: 'other',
                endpoint: '/test-access-logger',
                method: 'GET',
                status_code: 200,
                response_time_ms: 150
            }

            const response = await accessLogsService.create(data)

            setResult(response)
        } catch (err: any) {
            console.error('[TEST] Error capturado:', err)
            setError({
                message: err.message || 'Error desconocido',
                stack: err.stack,
                full: err
            })
        } finally {
            setLoading(false)
        }
    }

    const testGetLogs = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const response = await accessLogsService.getAll({ page: 1 })

            setResult(response)
        } catch (err: any) {
            console.error('[TEST] Error al obtener logs:', err)
            setError({
                message: err.message || 'Error desconocido',
                stack: err.stack,
                full: err
            })
        } finally {
            setLoading(false)
        }
    }

    const checkToken = () => {
        const token = localStorage.getItem('access_token')
        if (token) {
            alert(`Token encontrado: ${token.substring(0, 50)}...`)
        } else {
            alert('❌ No hay token en localStorage')
        }
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
                🧪 Test Access Logger
            </h1>

            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={testLog}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#3fad32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1
                    }}
                >
                    {loading ? 'Enviando...' : '✅ Crear Log de Prueba'}
                </button>

                <button
                    onClick={testGetLogs}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#297b1f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1
                    }}
                >
                    {loading ? 'Cargando...' : '📋 Obtener Logs'}
                </button>

                <button
                    onClick={checkToken}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    🔑 Verificar Token
                </button>
            </div>

            {result && (
                <div
                    style={{
                        padding: '20px',
                        backgroundColor: '#d4edda',
                        border: '2px solid #28a745',
                        borderRadius: '8px',
                        marginTop: '20px'
                    }}
                >
                    <h3 style={{ color: '#155724', marginBottom: '10px' }}>
                        ✅ Éxito
                    </h3>
                    <pre
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '14px'
                        }}
                    >
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: '20px',
                        backgroundColor: '#f8d7da',
                        border: '2px solid #dc3545',
                        borderRadius: '8px',
                        marginTop: '20px'
                    }}
                >
                    <h3 style={{ color: '#721c24', marginBottom: '10px' }}>
                        ❌ Error
                    </h3>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Mensaje:</strong> {error.message}
                    </div>
                    <pre
                        style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '12px'
                        }}
                    >
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </div>
            )}

            <div
                style={{
                    marginTop: '40px',
                    padding: '20px',
                    backgroundColor: '#e7f3ff',
                    border: '2px solid #2196F3',
                    borderRadius: '8px'
                }}
            >
                <h3 style={{ color: '#0d47a1', marginBottom: '10px' }}>
                    📘 Información
                </h3>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>
                        <strong>Endpoint:</strong> POST /api/access_logs/create_log/
                    </li>
                    <li>
                        <strong>Datos enviados:</strong>
                        <pre
                            style={{
                                backgroundColor: '#f8f9fa',
                                padding: '10px',
                                borderRadius: '4px',
                                marginTop: '5px',
                                fontSize: '14px'
                            }}
                        >
                            {JSON.stringify(
                                {
                                    module: 'other',
                                    endpoint: '/test-access-logger',
                                    method: 'GET',
                                    status_code: 200,
                                    response_time_ms: 150
                                },
                                null,
                                2
                            )}
                        </pre>
                    </li>
                    <li>
                        <strong>Token:</strong> Se obtiene automáticamente de localStorage
                    </li>
                </ul>
            </div>

            <div
                style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#fff3cd',
                    border: '2px solid #ffc107',
                    borderRadius: '8px'
                }}
            >
                <h3 style={{ color: '#856404', marginBottom: '10px' }}>
                    ⚠️ Consola del Navegador
                </h3>
                <p>
                    Abre la consola del navegador (F12) para ver los logs detallados con
                    el prefijo <code>[TEST]</code>
                </p>
            </div>
        </div>
    )
}
