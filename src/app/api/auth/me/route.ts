// src/app/api/me/route.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()
    const access_token = cookieStore.get('access_token')?.value
    const refresh_token = cookieStore.get('refresh_token')?.value

    if (!access_token || !refresh_token) {
        return NextResponse.json({ user: null }, { status: 401 })
    }

    let supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    )

    // Try using access token
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(access_token)

    // If access_token is invalid/expired, try refreshing
    if (error || !user) {
        const {
            data: refreshData,
            error: refreshError,
        } = await supabase.auth.refreshSession({ refresh_token })

        if (refreshError || !refreshData.session) {
            return NextResponse.json({ user: null }, { status: 401 })
        }

        // Use new session
        const newAccessToken = refreshData.session.access_token
        const newRefreshToken = refreshData.session.refresh_token

        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        )

        const {
            data: { user: refreshedUser },
            error: userError,
        } = await supabase.auth.getUser(newAccessToken)

        if (userError || !refreshedUser) {
            return NextResponse.json({ user: null }, { status: 401 })
        }

        const res = NextResponse.json({
            user: {
                email: refreshedUser.email,
                name: refreshedUser.user_metadata.full_name,
                token: newAccessToken,
            },
        })

        // Set new tokens as cookies
        res.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: true,
            maxAge: 60 * 60 * 24 * 7,
        })

        res.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
        })

        return res
    }

    // If user was valid initially
    return NextResponse.json({
        user: {
            email: user.email,
            name: user.user_metadata.full_name,
            token: access_token,
        },
    })
}
