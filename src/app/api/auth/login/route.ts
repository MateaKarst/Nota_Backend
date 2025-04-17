import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/utils/rateLimiter';
import { loginUser } from '@/routes/handlers/auth/loginHandler';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
        return NextResponse.json({ message: 'Too many attempts' }, { status: 429 });
    }

    const { email, password } = await req.json();

    const { token, error } = await loginUser(email, password);

    if (error || !token) {
        return NextResponse.json({ message: error }, { status: 401 });
    }

    const cookieStore = await cookies();

    cookieStore.set('sb-jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
        sameSite: 'strict',
    });

    return NextResponse.json({ message: 'Login successful' });
}
