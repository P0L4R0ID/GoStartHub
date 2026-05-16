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

        // Get all requests where this user is the mentor
        const requests = await prisma.mentorshipRequest.findMany({
            where: {
                mentorId: user.id,
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
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Error fetching mentor requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await verifyMentorSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { startupId, message } = body;

        if (!startupId) {
            return NextResponse.json(
                { error: 'Startup ID is required' },
                { status: 400 }
            );
        }

        // Verify startup exists and is approved
        const startup = await prisma.startup.findUnique({
            where: { id: startupId },
        });

        if (!startup) {
            return NextResponse.json(
                { error: 'Startup not found' },
                { status: 404 }
            );
        }

        if (startup.status !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Can only apply to approved startups' },
                { status: 400 }
            );
        }

        // Check if request already exists
        const existingRequest = await prisma.mentorshipRequest.findFirst({
            where: {
                mentorId: user.id,
                startupId: startupId,
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'You have already applied to mentor this startup' },
                { status: 400 }
            );
        }

        // Create mentorship request
        const mentorshipRequest = await prisma.mentorshipRequest.create({
            data: {
                mentorId: user.id,
                startupId: startupId,
                initiatedBy: 'MENTOR',
                message: message || null,
                status: 'PENDING',
            },
            include: {
                startup: true,
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
            },
        });

        return NextResponse.json(
            { message: 'Mentorship request sent successfully', request: mentorshipRequest },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating mentor request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
