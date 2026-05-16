import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

// GET - Fetch all active mentorship relationships for the logged-in user's startups
export async function GET(request: Request) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all active mentorship relationships where the user owns the startup
        // Query directly through the relationship's startup relation
        const relationships = await prisma.mentorshipRelationship.findMany({
            where: {
                status: 'ACTIVE',
                startup: {
                    innovatorId: user.id,
                },
            },
            include: {
                startup: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                    },
                },
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        expertise: true,
                        bio: true,
                        company: true,
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        return NextResponse.json({ relationships });
    } catch (error) {
        console.error('Error fetching user mentorships:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
