import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {

    const userCookies = await cookies()
    const token = userCookies.get('sb-jwt')?.value;

    console.log('Server-side JWT:', token); // 👈 appears in terminal logs

    return NextResponse.json({ token });
}
