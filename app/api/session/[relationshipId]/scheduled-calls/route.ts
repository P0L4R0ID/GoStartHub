import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMentorSession, verifyUserSession } from '@/lib/auth-helpers';
import { sendScheduledCallEmail } from '@/lib/email';

interface Params {
    params: Promise<{ relationshipId: string }>;
}

// GET - Fetch all scheduled calls for a session
export async function GET(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId } = await params;

        // Verify user has access to this relationship
        const relationship = await prisma.mentorshipRelationship.findUnique({
            where: { id: relationshipId },
            include: { startup: true },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Relationship not found' },
                { status: 404 }
            );
        }

        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Fetch scheduled calls
        const scheduledCalls = await prisma.scheduledCall.findMany({
            where: { relationshipId },
            include: {
                proposedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });

        // Auto-complete past CONFIRMED calls
        const now = new Date();
        const callsToComplete = scheduledCalls.filter(call => {
            if (call.status !== 'CONFIRMED') return false;
            const endTime = new Date(call.scheduledAt);
            endTime.setMinutes(endTime.getMinutes() + call.duration);
            return endTime < now;
        });

        // Update calls that should be completed
        if (callsToComplete.length > 0) {
            await prisma.scheduledCall.updateMany({
                where: {
                    id: { in: callsToComplete.map(c => c.id) }
                },
                data: { status: 'COMPLETED' }
            });

            // Update the local array to reflect changes
            callsToComplete.forEach(call => {
                const index = scheduledCalls.findIndex(c => c.id === call.id);
                if (index !== -1) {
                    scheduledCalls[index] = { ...scheduledCalls[index], status: 'COMPLETED' };
                }
            });
        }

        return NextResponse.json({ scheduledCalls });
    } catch (error) {
        console.error('Error fetching scheduled calls:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create a new scheduled call
export async function POST(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId } = await params;
        const body = await request.json();
        const { title, description, scheduledAt, duration } = body;

        if (!scheduledAt) {
            return NextResponse.json(
                { error: 'Scheduled time is required' },
                { status: 400 }
            );
        }

        // Verify user has access to this relationship and get full details
        const relationship = await prisma.mentorshipRelationship.findUnique({
            where: { id: relationshipId },
            include: {
                startup: {
                    include: {
                        innovator: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                mentor: {
                    select: { id: true, name: true, email: true }
                }
            },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Relationship not found' },
                { status: 404 }
            );
        }

        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Create scheduled call
        const scheduledCall = await prisma.scheduledCall.create({
            data: {
                relationshipId,
                proposedById: user.id,
                title: title || 'Mentorship Call',
                description,
                scheduledAt: new Date(scheduledAt),
                duration: duration || 30,
                meetingUrl: `https://meet.jit.si/GoStartHub-Session-${relationshipId}`,
            },
            include: {
                proposedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Send email notification to the other party
        const isMentor = user.id === relationship.mentorId;
        const recipientEmail = isMentor
            ? relationship.startup.innovator?.email
            : relationship.mentor.email;
        const recipientName = isMentor
            ? relationship.startup.innovator?.name || 'Innovator'
            : relationship.mentor.name || 'Mentor';

        if (recipientEmail) {
            await sendScheduledCallEmail(recipientEmail, {
                title: scheduledCall.title || undefined,
                scheduledAt: scheduledCall.scheduledAt,
                duration: scheduledCall.duration,
                proposerName: user.name || 'User',
                recipientName,
                startupTitle: relationship.startup.title,
            });
        }

        return NextResponse.json({ scheduledCall }, { status: 201 });
    } catch (error) {
        console.error('Error creating scheduled call:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
