import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const filePath = params.path.join('/')
    const cookieStore = await cookies()
    const access_token = cookieStore.get('access_token')?.value
    const refresh_token = cookieStore.get('refresh_token')?.value

    if (!access_token || !refresh_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    )

    const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    })

    if (sessionError) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { publicUrl } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath).data

    if (!publicUrl) {
        return NextResponse.json({ error: 'Failed to generate public URL' }, { status: 400 })
    }

    return NextResponse.json({
        file: {
            name: filePath.split('/').pop()!,
            url: publicUrl,
        },
    })
}
