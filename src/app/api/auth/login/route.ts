// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/rateLimiter';
import { loginUser } from '@/routes/handlers/auth/loginHandler';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
        return NextResponse.json({ message: 'Too many attempts' }, { status: 429 });
    }

    const { email, password } = await req.json();
    const { error, token, user } = await loginUser(email, password);

    if (error || !token) {
        return NextResponse.json({ message: error }, { status: 401 });
    }

    const response = NextResponse.json({
        message: 'Login successful',
        user: {
            email: user.email,
            name: user.user_metadata?.display_name ?? 'No name',
        },
    });

    // Set token as HttpOnly cookie
    response.cookies.set('sb-access-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
    });

    return response;
}
