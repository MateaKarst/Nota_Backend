// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
    const res = NextResponse.json({ message: 'Logged out' })

    // Delete the cookies by setting them with a maxAge of 0
    res.cookies.set('access_token', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 0,
    })

    res.cookies.set('refresh_token', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 0,
    })

    return res
}
