'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    telegramService,
    TelegramStatus,
    GenerateVerificationResponse,
} from '@/app/services/telegram.service'

export interface UseTelegramReturn {
    // Estado
    status: TelegramStatus | null
    loading: boolean
    error: string | null
    success: string | null
    verificationCode: string | null
    expiresIn: number | null

    // Métodos
    loadStatus: () => Promise<void>
    generateCode: () => Promise<void>
    verifyCode: (code: string) => Promise<void>
    unlinkAccount: () => Promise<void>
    toggleNotifications: (enabled: boolean) => Promise<void>
    clearMessages: () => void
}

export const useTelegram = (): UseTelegramReturn => {
    const [status, setStatus] = useState<TelegramStatus | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [verificationCode, setVerificationCode] = useState<string | null>(null)
    const [expiresIn, setExpiresIn] = useState<number | null>(null)

    const clearMessages = useCallback(() => {
        setError(null)
        setSuccess(null)
    }, [])

    const loadStatus = useCallback(async () => {
        try {
            setLoading(true)
            clearMessages()
            const data = await telegramService.getStatus()
            setStatus(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar el estado de Telegram')
        } finally {
            setLoading(false)
        }
    }, [clearMessages])

    const generateCode = useCallback(async () => {
        try {
            clearMessages()
            const response = await telegramService.generateVerificationCode()
            setVerificationCode(response.verification_code)
            setExpiresIn(response.expires_in_minutes)
            setSuccess(response.message)
        } catch (err: any) {
            setError(err.message || 'Error al generar código de verificación')
            throw err
        }
    }, [clearMessages])

    const verifyCode = useCallback(
        async (code: string) => {
            try {
                clearMessages()
                const response = await telegramService.verifyCode(code)
                setSuccess(response.message)
                await loadStatus()
            } catch (err: any) {
                setError(err.message || 'Error al verificar el código')
                throw err
            }
        },
        [clearMessages, loadStatus]
    )

    const unlinkAccount = useCallback(async () => {
        try {
            clearMessages()
            const response = await telegramService.unlinkAccount()
            setSuccess(response.message)
            await loadStatus()
        } catch (err: any) {
            setError(err.message || 'Error al desvincular la cuenta')
            throw err
        }
    }, [clearMessages, loadStatus])

    const toggleNotifications = useCallback(
        async (enabled: boolean) => {
            try {
                clearMessages()

                if (enabled) {
                    const response = await telegramService.enableNotifications()
                    setSuccess(response.message)
                } else {
                    const response = await telegramService.disableNotifications()
                    setSuccess(response.message)
                }

                await loadStatus()
            } catch (err: any) {
                setError(err.message || 'Error al actualizar las notificaciones')
                await loadStatus()
                throw err
            }
        },
        [clearMessages, loadStatus]
    )

    return {
        status,
        loading,
        error,
        success,
        verificationCode,
        expiresIn,
        loadStatus,
        generateCode,
        verifyCode,
        unlinkAccount,
        toggleNotifications,
        clearMessages,
    }
}
