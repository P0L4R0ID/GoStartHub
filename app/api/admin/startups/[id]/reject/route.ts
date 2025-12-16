import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const startup = await prisma.startup.update({
            where: { id: params.id },
            data: { status: 'REJECTED' },
        });

        return NextResponse.json({ startup });
    } catch (error) {
        console.error('Failed to reject startup:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
