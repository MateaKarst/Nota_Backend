// src/app/api/socials/route.ts
import { NextResponse } from 'next/server';
import { getAllSocials } from '@/routes/handlers/socialsHandler';
// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';

export async function GET() {
    try {
        // const cookieStore = await cookies();
        // const token = cookieStore.get('sb-jwt')?.value;

        // if (!token) {
        //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        // }

        // // Verify token
        // try {
        //     jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
        // } catch {
        //     return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        // }

        const socials = await getAllSocials();
        return NextResponse.json(socials);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching socials' }, { status: 500 });
    }
}
