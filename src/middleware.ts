// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PUBLIC_PATHS = ['/', '/auth/login', '/favicon.ico'];

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

    const token = req.cookies.get('sb-jwt')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/auth/dashboard/:path*', '/api/private/:path*'],
};
