import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
    // Try getting the cookies first
    const cookieStore = await cookies()
    const access_token = cookieStore.get('access_token')?.value
    const refresh_token = cookieStore.get('refresh_token')?.value

    if (!access_token || !refresh_token) {
        // If cookies are not available, look for Authorization header with Bearer token
        const authHeader = req.headers.get('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7) // Extract token after "Bearer "
            // Try using the provided Bearer token
            const { data: { user }, error } = await supabase.auth.getUser(token)

            if (error || !user) {
                return NextResponse.json({ user: null }, { status: 401 })
            }

            return NextResponse.json({
                user: {
                    email: user.email,
                    name: user.user_metadata.full_name,
                    token: token,
                },
            })
        }

        // If no cookies or authorization header found, return unauthorized
        return NextResponse.json({ user: null }, { status: 401 })
    }

    // Try using the access token from cookies
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(access_token)

    // If access_token is invalid/expired, try refreshing it
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

        // 🔄 Set new tokens as cookies
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

    // If user was valid initially (using access_token from cookies)
    return NextResponse.json({
        user: {
            email: user.email,
            name: user.user_metadata.full_name,
            token: access_token,
        },
    })
}
