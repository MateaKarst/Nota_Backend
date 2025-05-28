// src/app/api/auth/login-js/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { addCorsHeaders, handlePreflight } from '@/utils/cors'

export async function OPTIONS(request: Request) {
    return handlePreflight(request)
}

export async function POST(request: Request) {
    const { email, password } = await request.json()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
        const errorResponse = NextResponse.json(
            { message: error?.message || 'Login failed' },
            { status: 401 }
        )
        return addCorsHeaders(request, errorResponse)
    }

    // Return tokens in response so frontend can store them in JS-accessible cookies or localStorage
    return addCorsHeaders(
        request,
        NextResponse.json({
            message: 'Logged in',
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: {
                email: data.user?.email,
                name: data.user?.user_metadata?.full_name || '',
            },
        })
    )
}

// // src/app/api/auth/login/route.ts
// import { supabase } from '@/lib/supabase'
// import { NextResponse } from 'next/server'
// import { addCorsHeaders, handlePreflight } from '@/utils/cors'

// export async function OPTIONS(request: Request) {
//     return handlePreflight(request)
// }

// export async function POST(request: Request) {
//     const { email, password } = await request.json()
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password })

//     if (error || !data.session) {
//         const errorResponse = NextResponse.json(
//             { message: error?.message || 'Login failed' },
//             { status: 401 }
//         )
//         return addCorsHeaders(request, errorResponse)
//     }

//     const accessToken = data.session.access_token
//     const refreshToken = data.session.refresh_token

//     const response = NextResponse.json({ message: 'Logged in' })

//     response.cookies.set('access_token', accessToken, {
//         httpOnly: true,
//         path: '/',
//         sameSite: 'lax',
//         secure: true,
//         maxAge: 60 * 60 * 24 * 7,
//     })

//     response.cookies.set('refresh_token', refreshToken, {
//         httpOnly: true,
//         path: '/',
//         sameSite: 'lax',
//         secure: true,
//         maxAge: 60 * 60 * 24 * 30,
//     })

//     return addCorsHeaders(request, response)
// }
