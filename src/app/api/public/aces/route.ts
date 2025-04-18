import { NextResponse } from 'next/server';
import { getAllAces } from '@/routes/handlers/acesHandler';

export async function GET() {
    try {
        const aces = await getAllAces();
        console.log("aces route", aces)
        return NextResponse.json(aces);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching aces' }, { status: 500 });
    }
}
