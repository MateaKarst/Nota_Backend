"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface UserProfile {
    email: string
    name?: string
}

interface AppUtilsType {
    isLoggedIn: boolean
    setIsLoggedIn: (state: boolean) => void
    authUser: UserProfile | null
    cookies: null
    setCookies: () => void
    loading: boolean
    refreshUser: () => Promise<void>
}

const AppUtilsContext = createContext<AppUtilsType | undefined>(undefined)

export const AppUtilsProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [authUser, setAuthUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me', { cache: 'no-store' })
            if (res.ok) {
                const { user } = await res.json()
                if (user) {
                    setIsLoggedIn(true)
                    setAuthUser({ email: user.email, name: user.user_metadata?.name || '' })
                }
            } else {
                setIsLoggedIn(false)
                setAuthUser(null)
            }
        } catch {
            setIsLoggedIn(false)
            setAuthUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <AppUtilsContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                authUser,
                cookies: null,
                setCookies: () => {},
                loading,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AppUtilsContext.Provider>
    )
}

export const useAppHook = () => {
    const context = useContext(AppUtilsContext)

    if (!context) {
        throw new Error("AppUtils must be used within AppUtilsProvider")
    }
    return context
}
