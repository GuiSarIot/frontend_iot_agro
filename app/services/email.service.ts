'use client'

import {
    authenticatedGet,
    authenticatedPost,
} from '@/app/login/services/authenticated-fetch.service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ---- Interfaces ----

export interface EmailStatus {
    has_email: boolean
    email: string | null
    is_verified: boolean
    notifications_enabled: boolean
    can_receive_notifications: boolean
    verification_sent_at: string | null
    has_pending_verification: boolean
}

export interface SendVerificationResponse {
    success: boolean
    message: string
    sent_to: string
}

export interface UpdatePreferencesRequest {
    email_notifications_enabled: boolean
}

export interface UpdatePreferencesResponse {
    success: boolean
    message: string
    email_notifications_enabled: boolean
    can_receive_email_notifications: boolean
}

export interface EnableNotificationsResponse {
    success: boolean
    message: string
    notifications_enabled: boolean
    can_receive_email_notifications: boolean
}

export interface DisableNotificationsResponse {
    success: boolean
    message: string
    notifications_enabled: boolean
    can_receive_email_notifications: boolean
}

export interface SendEmailNotificationRequest {
    subject: string
    message: string
    notification_type?: 'info' | 'success' | 'warning' | 'error'
    send_to_all_verified?: boolean
    user_ids?: number[]
}

export interface SendEmailNotificationResponse {
    success: boolean
    message: string
    sent_count?: number
}

// ---- Servicio de Email ----

export const emailService = {
    /**
     * Obtiene el estado actual de email para el usuario autenticado
     */
    getStatus: async (): Promise<EmailStatus> => {
        return authenticatedGet<EmailStatus>(`${API_BASE_URL}/api/email/status/`)
    },

    /**
     * Envía un email de verificación al usuario
     */
    sendVerification: async (): Promise<SendVerificationResponse> => {
        return authenticatedPost<SendVerificationResponse>(
            `${API_BASE_URL}/api/email/send-verification/`,
            {}
        )
    },

    /**
     * Actualiza las preferencias de notificaciones de email (sin validaciones estrictas)
     * Útil para toggles en el frontend
     */
    updatePreferences: async (enabled: boolean): Promise<UpdatePreferencesResponse> => {
        return authenticatedPost<UpdatePreferencesResponse>(
            `${API_BASE_URL}/api/email/preferences/`,
            { email_notifications_enabled: enabled }
        )
    },

    /**
     * Activa las notificaciones de email (con validaciones estrictas)
     * Requiere que el email esté verificado
     */
    enableNotifications: async (): Promise<EnableNotificationsResponse> => {
        return authenticatedPost<EnableNotificationsResponse>(
            `${API_BASE_URL}/api/email/enable-notifications/`,
            {}
        )
    },

    /**
     * Desactiva las notificaciones de email
     */
    disableNotifications: async (): Promise<DisableNotificationsResponse> => {
        return authenticatedPost<DisableNotificationsResponse>(
            `${API_BASE_URL}/api/email/disable-notifications/`,
            {}
        )
    },

    /**
     * Envía una notificación por email a usuarios específicos o todos los verificados
     */
    sendNotification: async (request: SendEmailNotificationRequest): Promise<SendEmailNotificationResponse> => {
        return authenticatedPost<SendEmailNotificationResponse>(
            `${API_BASE_URL}/api/email/send-notification/`,
            request
        )
    },
}
