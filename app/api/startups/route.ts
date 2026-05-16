import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const innovatorId = searchParams.get('innovatorId');
        const includeArchived = searchParams.get('includeArchived') === 'true';

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        } else if (!includeArchived && !innovatorId) {
            // For public listing, exclude FINISHED and ARCHIVED by default
            where.status = {
                notIn: ['FINISHED', 'ARCHIVED', 'REJECTED', 'PENDING']
            };
        }

        if (innovatorId) {
            where.innovatorId = innovatorId;
        }

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
