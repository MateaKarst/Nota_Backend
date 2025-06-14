// src/app/api/me/route.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { addCorsHeaders, handlePreflight } from '@/utils/cors'
// const isProduction = process.env.NODE_ENV === "production";
const isProduction = false; 
export async function OPTIONS(request: Request) {
    return handlePreflight(request)
}

export async function GET(request: Request) {
    // 1. Try to get tokens from cookies
    const cookieStore = await cookies()
    let access_token = cookieStore.get('access_token')?.value
    let refresh_token = cookieStore.get('refresh_token')?.value

    // 2. If no tokens in cookies, try to get from headers
    if (!access_token || !refresh_token) {
        const authHeader = request.headers.get('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            access_token = authHeader.substring('Bearer '.length)
        }
        const refreshHeader = request.headers.get('x-refresh-token')
        if (refreshHeader) {
            refresh_token = refreshHeader
        }
    }

    // If still no tokens, return user null (allow no token request)
    if (!access_token || !refresh_token) {
        // This allows /me without token (e.g. admin panel) returning null user
        const res = NextResponse.json({ user: null }, { status: 200 })
        return addCorsHeaders(request, res)
    }

    // Create Supabase client
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

    // try to get user with access token
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(access_token)

    // if token invalid or no user, try refresh
    if (error || !user) {
        const {
            data: refreshData,
            error: refreshError,
        } = await supabase.auth.refreshSession({ refresh_token })

        if (refreshError || !refreshData.session) {
            // refresh failed, return user null/401 
            const res = NextResponse.json({ user: null }, { status: 200 })
            return addCorsHeaders(request, res)
        }

        const newAccessToken = refreshData.session.access_token
        const newRefreshToken = refreshData.session.refresh_token

        // recreate supabase client with new access token
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
            const res = NextResponse.json({ user: null }, { status: 200 })
            return addCorsHeaders(request, res)
        }

        // set refreshed tokens as httpOnly cookies (always)
        const res = NextResponse.json({
            user: {
                email: refreshedUser.email,
                name: refreshedUser.user_metadata?.full_name || '',
            },
        })

        res.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax', 
            secure: isProduction,                   // true in prod (https), false in dev (http)
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        })

        res.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        })

        return addCorsHeaders(request, res)
    }

    // user valid on first try, return user info
    const res = NextResponse.json({
        user: {
            id: user?.id,
            email: user.email,
            name: user.user_metadata?.full_name || '',
            access_token: access_token,
            refresh_token: refresh_token,
        },
    })

    return addCorsHeaders(request, res)
}
