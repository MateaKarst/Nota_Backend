// /api/me/route.ts
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const userCookies = await cookies()
    const token = userCookies.get('sb-jwt')?.value;

    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) return NextResponse.json({ user: null }, { status: 401 });

    return NextResponse.json({
        user: {
            email: data.user.email,
            name: data.user.user_metadata?.display_name ?? "No name"
        }
    });
}
