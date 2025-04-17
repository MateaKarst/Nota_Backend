// src/routes/handlers/auth/logoutHandler.ts
import { NextResponse } from "next/server";
import cookie from "cookie";

/**
 * Logs out the user from Supabase and clears the sb-jwt cookie.
 */
export async function logoutHandler() {
    // Remove the 'sb-jwt' cookie by setting it with an expired maxAge
    const cookiesToSet = cookie.serialize('sb-jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,  // Expire the cookie
        path: '/',
        sameSite: 'strict',
    });

    // Set the cookie to expire
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Set the cookie header for logout
    response.headers.set('Set-Cookie', cookiesToSet);

    return response;
}
