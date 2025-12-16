import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const startup = await prisma.startup.update({
            where: { id },
            data: { status: 'APPROVED' },
        });

        return NextResponse.json({ startup });
    } catch (error) {
        console.error('Failed to approve startup:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
