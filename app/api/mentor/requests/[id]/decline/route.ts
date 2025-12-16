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
            },
        });

        if (!mentorshipRequest) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 }
            );
        }

        // Verify user has permission to decline
        let canDecline = false;
        if (mentorshipRequest.initiatedBy === 'MENTOR' && mentorshipRequest.startup.innovatorId === user.id) {
            canDecline = true;
        } else if (mentorshipRequest.initiatedBy === 'STARTUP' && mentorshipRequest.mentorId === user.id) {
            canDecline = true;
        }

        if (!canDecline) {
            return NextResponse.json(
                { error: 'You do not have permission to decline this request' },
                { status: 403 }
            );
        }

        // Update request status
        const updatedRequest = await prisma.mentorshipRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                response: responseMessage || null,
            },
        });

        return NextResponse.json({
            message: 'Mentorship request declined',
            request: updatedRequest,
        });
    } catch (error) {
        console.error('Error declining request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
