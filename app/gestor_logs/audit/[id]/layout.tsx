import ProtectedRoute from '@/components/protectedRoute/protectedRoute'

export default function AuditLogDetailLayout({
    children
}: {
    children: React.ReactNode
}) {
    return <ProtectedRoute>{children}</ProtectedRoute>
}
