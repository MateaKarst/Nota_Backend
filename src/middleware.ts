// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
//import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
    // Log the request URL for debugging
    console.log('🌐 Middleware triggered on:', request.nextUrl.pathname);

    // Create middleware client to access request and response
    const res = NextResponse.next();
    // const supabase = createMiddlewareClient({ req: request, res });

    // // Check for the authenticated user from cookies
    // const { data: { user }, error } = await supabase.auth.getUser();

    // // Log the cookie value for debugging
    // console.log('🧪 Middleware cookie:', request.headers.get('cookie'));
    // console.log('🧑‍💻 Authenticated user:', user?.email || 'No user');

    // // If there's no user and we are trying to access restricted route, return 401
    // if (request.nextUrl.pathname.startsWith('/api/socials')) {
    //     if (!user) {
    //         console.log('🚫 Unauthorized access to /api/socials');
    //         return new NextResponse(
    //             JSON.stringify({ message: 'Unauthorized' }),
    //             { status: 401, headers: { 'Content-Type': 'application/json' } }
    //         );
    //     }
    // }

    // // Log any errors in case Supabase fails to authenticate the user
    // if (error) {
    //     console.error('Error authenticating user:', error.message);
    // }

    return res;
}

export const config = {
    //matcher: ['/api/:path*'], // This matches all API routes
};
