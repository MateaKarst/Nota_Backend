// src/app/api/debug/token/route.ts
// app/api/debug/token/route.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    return Response.json({ token: session?.access_token ?? null });
}
