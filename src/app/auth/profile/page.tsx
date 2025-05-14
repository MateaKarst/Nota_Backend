'use client'

import { useAppHook } from '@/context/AppUtils'
import { useEffect } from 'react'

export default function ProfilePage() {
    const { authUser, isLoggedIn } = useAppHook()

    useEffect(() => {
        if (!isLoggedIn || !authUser) return
    }, [isLoggedIn, authUser])

    if (!isLoggedIn || !authUser) {
        return <p>You are not logged in.</p>
    }
    console.log(`context on authUser: ${authUser}`)

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
            <div className="bg-gray-100 p-4 rounded-lg shadow">
                <p><strong>Email:</strong> {authUser.email}</p>
                <p><strong>Name:</strong> {authUser.name}</p>
            </div>
        </div>
    )
}
