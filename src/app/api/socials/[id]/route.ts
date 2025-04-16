import { NextResponse } from 'next/server';
import { getSocialById } from '@/routes/handlers/socialsHandler';

export async function GET(_: Request, context: { params: { id: string } }) {
    const { id } = context.params;

    try {
        const social = await getSocialById(id);
        return NextResponse.json(social);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching social' }, { status: 500 });
    }
}
