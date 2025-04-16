import { NextResponse } from 'next/server';
import { getAllSocials } from '@/routes/handlers/socialsHandler';

export async function GET() {
    try {
        const socials = await getAllSocials();
        return NextResponse.json(socials);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching socials' }, { status: 500 });
    }
}
