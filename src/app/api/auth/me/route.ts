// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('sb-access-token')?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
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
        return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: data.user });
}
