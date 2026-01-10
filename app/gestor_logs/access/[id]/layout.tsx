import ProtectedRoute from '@/components/protectedRoute/protectedRoute'

export default function AccessLogDetailLayout({
    children
}: {
    children: React.ReactNode
}) {
    return <ProtectedRoute>{children}</ProtectedRoute>
}
