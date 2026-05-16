import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMentorSession, verifyUserSession } from '@/lib/auth-helpers';

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Parse body if present (optional)
        let responseMessage = null;
        try {
            const body = await request.json();
            responseMessage = body.response || null;
        } catch {
            // No body provided, that's fine
        }

        // Get the request
        const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
            where: { id },
            include: {
                startup: true,
                mentor: true,
            },
        });

        if (!mentorshipRequest) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 }
            );
        }

        // Verify user has permission to accept
        // If initiated by mentor, startup owner accepts
        // If initiated by startup, mentor accepts
        let canAccept = false;
        if (mentorshipRequest.initiatedBy === 'MENTOR' && mentorshipRequest.startup.innovatorId === user.id) {
            canAccept = true;
        } else if (mentorshipRequest.initiatedBy === 'STARTUP' && mentorshipRequest.mentorId === user.id) {
            canAccept = true;
        }

        if (!canAccept) {
            return NextResponse.json(
                { error: 'You do not have permission to accept this request' },
                { status: 403 }
            );
        }

        // Update request status
        const updatedRequest = await prisma.mentorshipRequest.update({
            where: { id },
            data: {
                status: 'ACCEPTED',
                response: responseMessage || null,
            },
        });

        // Create mentorship relationship
        const relationship = await prisma.mentorshipRelationship.create({
            data: {
                mentorId: mentorshipRequest.mentorId,
                startupId: mentorshipRequest.startupId,
                status: 'ACTIVE',
            },
        });

        return NextResponse.json({
            message: 'Mentorship request accepted',
            request: updatedRequest,
            relationship,
        });
    } catch (error) {
        console.error('Error accepting request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
