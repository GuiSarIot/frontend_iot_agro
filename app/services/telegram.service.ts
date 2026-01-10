'use client'

import {
    authenticatedGet,
    authenticatedPost,
} from '@/app/login/services/authenticated-fetch.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ---- Interfaces ----

export interface TelegramStatus {
    is_linked: boolean
    is_verified: boolean
    notifications_enabled: boolean
    can_receive_notifications: boolean
    telegram_username: string | null
    has_pending_verification: boolean
}

export interface GenerateVerificationResponse {
    success: boolean
    verification_code: string
    expires_in_minutes: number
    message: string
}

export interface VerifyCodeRequest {
    code: string
}

export interface VerifyCodeResponse {
    success: boolean
    message: string
}

export interface UnlinkAccountResponse {
    success: boolean
    message: string
}

export interface UpdatePreferencesRequest {
    telegram_notifications_enabled: boolean
}

export interface UpdatePreferencesResponse {
    success: boolean
    message: string
    telegram_notifications_enabled: boolean
    can_receive_notifications: boolean
}

export interface EnableNotificationsResponse {
    success: boolean
    message: string
    notifications_enabled: boolean
    can_receive_notifications: boolean
}

export interface DisableNotificationsResponse {
    success: boolean
    message: string
    notifications_enabled: boolean
    can_receive_notifications: boolean
}

export interface SendNotificationRequest {
    user_ids?: number[]
    message: string
    notification_type?: 'info' | 'warning' | 'error' | 'success'
    send_to_all_verified?: boolean
}

export interface SendNotificationResponse {
    success: boolean
    message: string
    sent_to: Array<{
        user_id: number
        username: string
        chat_id: string
    }>
}

// ---- Servicio de Telegram ----

export const telegramService = {
    /**
     * Obtiene el estado actual de Telegram para el usuario autenticado
     */
    getStatus: async (): Promise<TelegramStatus> => {
        return authenticatedGet<TelegramStatus>(`${API_BASE_URL}/api/telegram/status/`)
    },

    /**
     * Genera un código de verificación para vincular la cuenta de Telegram
     */
    generateVerificationCode: async (): Promise<GenerateVerificationResponse> => {
        return authenticatedPost<GenerateVerificationResponse>(
            `${API_BASE_URL}/api/telegram/generate-verification/`,
            {}
        )
    },

    /**
     * Verifica el código de verificación desde la web
     */
    verifyCode: async (code: string): Promise<VerifyCodeResponse> => {
        return authenticatedPost<VerifyCodeResponse>(
            `${API_BASE_URL}/api/telegram/verify-code/`,
            { code }
        )
    },

    /**
     * Desvíncula la cuenta de Telegram del usuario actual
     */
    unlinkAccount: async (): Promise<UnlinkAccountResponse> => {
        return authenticatedPost<UnlinkAccountResponse>(
            `${API_BASE_URL}/api/telegram/unlink-account/`,
            {}
        )
    },

    /**
     * Actualiza las preferencias de notificaciones de Telegram (sin validaciones estrictas)
     * Útil para toggles en el frontend
     */
    updatePreferences: async (enabled: boolean): Promise<UpdatePreferencesResponse> => {
        return authenticatedPost<UpdatePreferencesResponse>(
            `${API_BASE_URL}/api/telegram/preferences/`,
            { telegram_notifications_enabled: enabled }
        )
    },

    /**
     * Activa las notificaciones de Telegram (con validaciones estrictas)
     * Requiere que la cuenta esté vinculada y verificada
     */
    enableNotifications: async (): Promise<EnableNotificationsResponse> => {
        return authenticatedPost<EnableNotificationsResponse>(
            `${API_BASE_URL}/api/telegram/enable-notifications/`,
            {}
        )
    },

    /**
     * Desactiva las notificaciones de Telegram
     */
    disableNotifications: async (): Promise<DisableNotificationsResponse> => {
        return authenticatedPost<DisableNotificationsResponse>(
            `${API_BASE_URL}/api/telegram/disable-notifications/`,
            {}
        )
    },

    /**
     * Envía una notificación a usuarios específicos (solo para superusuarios)
     */
    sendNotification: async (
        request: SendNotificationRequest
    ): Promise<SendNotificationResponse> => {
        return authenticatedPost<SendNotificationResponse>(
            `${API_BASE_URL}/api/telegram/send-notification/`,
            request
        )
    },
}
