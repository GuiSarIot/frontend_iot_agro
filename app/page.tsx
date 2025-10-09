'use client'

import React from 'react'

import ProtectedRoute from '@/components/protectedRoute/protectedRoute'

const RootPage: React.FC = () => {
    return <ProtectedRoute autoRedirection />
}

export default RootPage
