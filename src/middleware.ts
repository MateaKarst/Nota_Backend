import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PUBLIC_PATHS = ['/', '/auth/login', '/favicon.ico'];

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

    const token = req.cookies.get('access_token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        }
    );

    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/auth/dashboard/:path*', '/api/private/:path*, "/api/:path*"'],
};
