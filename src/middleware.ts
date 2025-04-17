// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = ['/', '/auth/login', '/favicon.ico'];

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const pathname = url.pathname;

    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    const token = req.cookies.get('sb-jwt')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
        // Verify token with Supabase secret key
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
        
        if (decoded) {
            return NextResponse.next();
        } else {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    } catch {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}

export const config = {
    matcher: ['/auth/dashboard/:path*', '/api/private/:path*'],
};

