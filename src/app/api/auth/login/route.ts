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

    const userId = data.user?.id;
    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    // Fetch user_details from your custom table
    const { data: userDetails, error: detailsError } = await supabase
        .from('user_details')
        .select('*')
        .eq('user_id', userId)
        .single(); // Assuming there's one record per user

    if (detailsError) {
        console.error('Error fetching user_details:', detailsError.message);
    }

    const response = NextResponse.json({
        message: 'Logged in',
        user: {
            id: data.user?.id,
            email: data.user?.email,
            name: data.user?.user_metadata?.full_name || '',
            access_token: accessToken,
            refresh_token: refreshToken,
            user_details: userDetails || null,
        },
    });

    response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return addCorsHeaders(request, response);
}
