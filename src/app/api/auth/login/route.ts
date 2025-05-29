// src/app/api/auth/login-js/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { addCorsHeaders, handlePreflight } from '@/utils/cors'

export async function OPTIONS(request: Request) {
    return handlePreflight(request);
}

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
        const errorResponse = NextResponse.json(
            { message: error?.message || 'Login failed' },
            { status: 401 }
        );
        return addCorsHeaders(request, errorResponse);
    }

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    const response = NextResponse.json({
        message: 'Logged in',
        user: {
            id:data.user?.id,
            email: data.user?.email,
            name: data.user?.user_metadata?.full_name || '',
            access_token: accessToken,
            refresh_token: refreshToken,
        },
    });

    // Set cookies AFTER response is created
    response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true, // set to false in dev if needed
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true, // set to false in dev if needed
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return addCorsHeaders(request, response);
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
