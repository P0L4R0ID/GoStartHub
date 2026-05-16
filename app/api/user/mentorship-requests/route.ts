import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

// GET - Fetch all mentorship requests for the logged-in user's startups
export async function GET(request: Request) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all startups owned by this user
        const userStartups = await prisma.startup.findMany({
            where: { innovatorId: user.id },
            select: { id: true },
        });

        const startupIds = userStartups.map(s => s.id);

        if (startupIds.length === 0) {
            return NextResponse.json({ requests: [] });
        }

        // Get all mentorship requests for user's startups
        const requests = await prisma.mentorshipRequest.findMany({
            where: {
                startupId: { in: startupIds },
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
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Error fetching user mentorship requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
