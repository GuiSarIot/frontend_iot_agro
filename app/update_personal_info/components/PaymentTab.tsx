import { useState } from 'react'
import Swal from 'sweetalert2'
import { UserInfoForm } from './types'
import ProfileCardCentered from './ProfileCardCentered'
import { useAppContext } from '@/context/appContext'
import styles from '../styles.module.css'

interface PaymentTabProps {
    userInfo: UserInfoForm
    getInitials: (firstName?: string, lastName?: string) => string
    formatDate: (dateString?: string) => string
}

interface PaymentHistory {
    id: number
    date: string
    description: string
    amount: number
    status: 'completed' | 'pending' | 'failed'
    method: string
}

export default function PaymentTab({ userInfo, getInitials, formatDate }: PaymentTabProps) {
    const { appState } = useAppContext()
    const userPermissions = appState.userInfo.roles || []
    
    const [selectedBank, setSelectedBank] = useState('')
    const [amount, setAmount] = useState('')
    
    // Verificar si el usuario tiene permisos para realizar pagos
    const canMakePayments = userPermissions.includes('realizar_pagos') || 
                           userPermissions.includes('gestionar_suscripciones') ||
                           userInfo.is_superuser
    
    // Historial de pagos de ejemplo (esto vendría del backend)
    const [paymentHistory] = useState<PaymentHistory[]>([
        {
            id: 1,
            date: '2025-12-15T10:30:00',
            description: 'Suscripción Premium - Mes de Diciembre',
            amount: 49900,
            status: 'completed',
            method: 'PSE - Bancolombia'
        },
        {
            id: 2,
            date: '2025-11-15T14:20:00',
            description: 'Suscripción Premium - Mes de Noviembre',
            amount: 49900,
            status: 'completed',
            method: 'PSE - Banco de Bogotá'
        },
        {
            id: 3,
            date: '2025-10-15T09:15:00',
            description: 'Suscripción Premium - Mes de Octubre',
            amount: 49900,
            status: 'completed',
            method: 'Tarjeta de Crédito'
        }
    ])

    const banks = [
        { code: 'bancolombia', name: 'Bancolombia' },
        { code: 'davivienda', name: 'Davivienda' },
        { code: 'banco_bogota', name: 'Banco de Bogotá' },
        { code: 'bbva', name: 'BBVA Colombia' },
        { code: 'banco_popular', name: 'Banco Popular' },
        { code: 'colpatria', name: 'Scotiabank Colpatria' },
        { code: 'occidente', name: 'Banco de Occidente' },
        { code: 'av_villas', name: 'Banco AV Villas' },
        { code: 'otros', name: 'Otros bancos' }
    ]

    const handlePSEPayment = () => {
        // Verificar permisos
        if (!canMakePayments) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos para realizar pagos. Contacta al administrador.',
                confirmButtonColor: '#00a86b'
            })
            return
        }
        
        if (!selectedBank || !amount) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor seleccione un banco e ingrese el monto',
                confirmButtonColor: '#00a86b'
            })
            return
        }

        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Monto inválido',
                text: 'Por favor ingrese un monto válido',
                confirmButtonColor: '#00a86b'
            })
            return
        }

        // Simulación del proceso de pago PSE
        Swal.fire({
            title: 'Procesando pago',
            text: 'Redirigiendo a la plataforma de pago seguro PSE...',
            icon: 'info',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Pago en proceso',
                html: `
                    <p>Se ha iniciado el proceso de pago por <strong>$${numAmount.toLocaleString('es-CO')}</strong></p>
                    <p>Banco seleccionado: <strong>${banks.find(b => b.code === selectedBank)?.name}</strong></p>
                    <p>Será redirigido a la plataforma de su banco para completar la transacción.</p>
                `,
                confirmButtonColor: '#00a86b'
            })
            
            // Limpiar formulario
            setSelectedBank('')
            setAmount('')
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return styles.statusCompleted
            case 'pending':
                return styles.statusPending
            case 'failed':
                return styles.statusFailed
            default:
                return ''
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completado'
            case 'pending':
                return 'Pendiente'
            case 'failed':
                return 'Fallido'
            default:
                return status
        }
    }

    return (
        <div className={styles.contentLayout}>
            {/* Panel izquierdo - Métodos de pago */}
            <div className={styles.infoPanel}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Métodos de pago</h2>
                        <p className={styles.sectionSubtitle}>
                            Gestione sus métodos de pago y realice transacciones seguras
                        </p>
                    </div>
                    <div className={styles.permissionBadges}>
                        {userInfo.rol_detail && (
                            <span className={styles.roleBadgeSmall}>
                                {userInfo.rol_detail.nombre}
                            </span>
                        )}
                        {canMakePayments ? (
                            <span className={styles.permissionBadgeActive}>
                                ✓ Pagos habilitados
                            </span>
                        ) : (
                            <span className={styles.permissionBadgeInactive}>
                                ⚠ Pagos deshabilitados
                            </span>
                        )}
                    </div>
                </div>

                {/* Sección PSE */}
                <div className={styles.paymentSection}>
                    <div className={styles.paymentMethodCard}>
                        <div className={styles.paymentMethodHeader}>
                            <div className={styles.paymentMethodIcon}>🏦</div>
                            <div>
                                <h3 className={styles.paymentMethodTitle}>Pago PSE</h3>
                                <p className={styles.paymentMethodSubtitle}>
                                    Pague de forma segura desde su cuenta bancaria
                                </p>
                            </div>
                        </div>

                        <div className={styles.paymentForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Seleccione su banco</label>
                                <select
                                    className={styles.formSelect}
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                >
                                    <option value="">Seleccione un banco...</option>
                                    {banks.map((bank) => (
                                        <option key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Monto a pagar (COP)</label>
                                <input
                                    type="number"
                                    className={styles.formInput}
                                    placeholder="49900"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    step="100"
                                />
                            </div>

                            <button
                                className={styles.psePayButton}
                                onClick={handlePSEPayment}
                                disabled={!canMakePayments}
                                title={!canMakePayments ? 'No tienes permisos para realizar pagos' : 'Procesar pago con PSE'}
                            >
                                <span className={styles.pseIcon}>{canMakePayments ? '🔒' : '🔐'}</span>
                                {canMakePayments ? 'Pagar con PSE' : 'Pago restringido'}
                            </button>
                            {!canMakePayments && (
                                <div className={styles.permissionWarning}>
                                    <span className={styles.warningIcon}>⚠️</span>
                                    <span>Necesitas permisos de <strong>realizar_pagos</strong> o <strong>gestionar_suscripciones</strong> para usar este método.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Otros métodos de pago */}
                    <div className={styles.otherPaymentMethods}>
                        <h3 className={styles.otherMethodsTitle}>Otros métodos de pago</h3>
                        
                        <div className={styles.paymentMethodList}>
                            <div className={styles.paymentMethodItem}>
                                <span className={styles.methodIcon}>💳</span>
                                <span className={styles.methodName}>Tarjetas de crédito/débito</span>
                                <span className={styles.methodStatus}>Próximamente</span>
                            </div>
                            
                            <div className={styles.paymentMethodItem}>
                                <span className={styles.methodIcon}>📱</span>
                                <span className={styles.methodName}>Billeteras digitales</span>
                                <span className={styles.methodStatus}>Próximamente</span>
                            </div>
                            
                            <div className={styles.paymentMethodItem}>
                                <span className={styles.methodIcon}>🏪</span>
                                <span className={styles.methodName}>Efectivo (Baloto, Efecty)</span>
                                <span className={styles.methodStatus}>Próximamente</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historial de pagos */}
                <div className={styles.paymentHistorySection}>
                    <h3 className={styles.historyTitle}>Historial de transacciones</h3>
                    
                    {paymentHistory.length > 0 ? (
                        <div className={styles.historyList}>
                            {paymentHistory.map((payment) => (
                                <div key={payment.id} className={styles.historyItem}>
                                    <div className={styles.historyItemHeader}>
                                        <div className={styles.historyItemInfo}>
                                            <div className={styles.historyItemTitle}>
                                                {payment.description}
                                            </div>
                                            <div className={styles.historyItemMeta}>
                                                <span className={styles.historyDate}>
                                                    {new Date(payment.date).toLocaleDateString('es-CO', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <span className={styles.historyDivider}>•</span>
                                                <span className={styles.historyMethod}>{payment.method}</span>
                                            </div>
                                        </div>
                                        <div className={styles.historyItemRight}>
                                            <div className={styles.historyAmount}>
                                                {formatCurrency(payment.amount)}
                                            </div>
                                            <span className={`${styles.historyStatus} ${getStatusBadge(payment.status)}`}>
                                                {getStatusText(payment.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyHistory}>
                            <span className={styles.emptyIcon}>📭</span>
                            <p>No hay transacciones registradas</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel derecho - Card de perfil */}
            <ProfileCardCentered
                userInfo={userInfo}
                getInitials={getInitials}
                formatDate={formatDate}
            />
        </div>
    )
}
