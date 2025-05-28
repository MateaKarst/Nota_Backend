import { NextResponse } from 'next/server'
import { addCorsHeaders, handlePreflight } from '@/utils/cors'

export async function OPTIONS(request: Request) {
    return handlePreflight(request)
}

export async function POST(request: Request) {
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

    return addCorsHeaders(request, res)
}
