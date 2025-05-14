// src/app/api/auth/login/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const { email, password } = await req.json()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
        return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 401 })
    }

    const accessToken = data.session.access_token
    const refreshToken = data.session.refresh_token
    const user = data.user

    const res = NextResponse.json({
        message: 'Logged in successfully',
        user: {
            email: user?.email,
            id: user?.id,
            full_name: user?.user_metadata?.full_name, // Assuming you have a full_name field in the metadata
            // Add other user properties you want to send here
        },
        tokens: {
            access_token: accessToken,
            refresh_token: refreshToken
        }
    })

    // ✅ Use lowercase 'lax' instead of 'Lax'
    res.cookies.set('access_token', accessToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax', // <-- FIXED HERE
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
    })

    res.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax', // <-- FIXED HERE
        secure: true,
        maxAge: 60 * 60 * 24 * 30,
    })

    return res
}