import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: Request) {
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = status && status !== 'all'
            ? { status: status.toUpperCase() }
            : {};

        const startups = await prisma.startup.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ startups });
    } catch (error) {
        console.error('Failed to fetch startups:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
