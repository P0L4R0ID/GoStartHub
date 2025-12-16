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

        // Get all active mentorship relationships for this mentor
        const relationships = await prisma.mentorshipRelationship.findMany({
            where: {
                mentorId: user.id,
                status: 'ACTIVE',
            },
            include: {
                startup: {
                    include: {
                        innovator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        return NextResponse.json({ relationships });
    } catch (error) {
        console.error('Error fetching mentor relationships:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
