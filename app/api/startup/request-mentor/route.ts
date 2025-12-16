import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

// POST - Create a mentorship request from startup to mentor
export async function POST(request: Request) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { mentorId, startupId, message } = body;

        if (!mentorId || !startupId) {
            return NextResponse.json(
                { error: 'Mentor ID and Startup ID are required' },
                { status: 400 }
            );
        }

        // Verify the user owns this startup
        const startup = await prisma.startup.findUnique({
            where: { id: startupId },
        });

        if (!startup) {
            return NextResponse.json(
                { error: 'Startup not found' },
                { status: 404 }
            );
        }

        if (startup.innovatorId !== user.id) {
            return NextResponse.json(
                { error: 'You can only request mentorship for your own startups' },
                { status: 403 }
            );
        }

        if (startup.status !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Only approved startups can request mentorship' },
                { status: 400 }
            );
        }

        // Verify mentor exists and is a mentor
        const mentor = await prisma.user.findUnique({
            where: { id: mentorId },
        });

        if (!mentor || mentor.role !== 'MENTOR') {
            return NextResponse.json(
                { error: 'Mentor not found' },
                { status: 404 }
            );
        }

        // Check if request already exists
        const existingRequest = await prisma.mentorshipRequest.findFirst({
            where: {
                mentorId: mentorId,
                startupId: startupId,
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'A mentorship request already exists for this mentor and startup' },
                { status: 400 }
            );
        }

        // Check if an active relationship already exists
        const existingRelationship = await prisma.mentorshipRelationship.findFirst({
            where: {
                mentorId: mentorId,
                startupId: startupId,
                status: 'ACTIVE',
            },
        });

        if (existingRelationship) {
            return NextResponse.json(
                { error: 'This mentor is already mentoring this startup' },
                { status: 400 }
            );
        }

        // Create mentorship request
        const mentorshipRequest = await prisma.mentorshipRequest.create({
            data: {
                mentorId: mentorId,
                startupId: startupId,
                initiatedBy: 'STARTUP',
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
        console.error('Error creating mentorship request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
