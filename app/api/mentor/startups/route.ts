import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMentorSession } from '@/lib/auth-helpers';

export async function GET(request: Request) {
    try {
        const user = await verifyMentorSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const stage = searchParams.get('stage');
        const projectType = searchParams.get('projectType');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build filter conditions
        // Temporarily show all startups (for debugging - remove status filter)
        const where: any = {};

        if (category) {
            where.category = category;
        }

        if (stage) {
            where.stage = stage;
        }

        if (projectType) {
            where.projectType = projectType;
        }

        const [startups, total] = await Promise.all([
            prisma.startup.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    innovator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.startup.count({ where }),
        ]);

        return NextResponse.json({
            startups,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching startups for mentor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
