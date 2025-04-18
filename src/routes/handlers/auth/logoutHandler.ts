// src/routes/handlers/auth/logoutHandler.ts
import { NextResponse } from "next/server";
/**
 * Logs out the user from Supabase and clears the sb-jwt cookie.
 */
export async function logoutHandler() {
    const response = NextResponse.json({ message: 'Logged out successfully' });

    response.cookies.set({
        name: 'sb-jwt',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, // expire immediately
        path: '/',
        sameSite: 'strict',
    });

    return response;
}