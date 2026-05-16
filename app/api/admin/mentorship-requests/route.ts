import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth-helpers';

export async function GET(request: Request) {
    try {
        const admin = await verifyAdminSession();
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all mentorship requests
        const requests = await prisma.mentorshipRequest.findMany({
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        bio: true,
                        company: true,
                        expertise: true,
                    },
                },
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
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
