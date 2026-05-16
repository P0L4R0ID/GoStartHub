import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMentorSession, verifyUserSession } from '@/lib/auth-helpers';
import { sendCallDeclinedEmail } from '@/lib/email';

interface Params {
    params: Promise<{ relationshipId: string; callId: string }>;
}

// POST - Decline a scheduled call
export async function POST(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId, callId } = await params;

        // Fetch the scheduled call with full relationship details
        const scheduledCall = await prisma.scheduledCall.findUnique({
            where: { id: callId },
            include: {
                relationship: {
                    include: {
                        startup: true,
                        mentor: {
                            select: { id: true, name: true, email: true }
                        }
                    },
                },
                proposedBy: {
                    select: { id: true, name: true, email: true }
                }
            },
        });

        if (!scheduledCall) {
            return NextResponse.json(
                { error: 'Scheduled call not found' },
                { status: 404 }
            );
        }

        if (scheduledCall.relationshipId !== relationshipId) {
            return NextResponse.json(
                { error: 'Invalid relationship' },
                { status: 400 }
            );
        }

        // Either party can decline
        const relationship = scheduledCall.relationship;
        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Update status to DECLINED
        const updatedCall = await prisma.scheduledCall.update({
            where: { id: callId },
            data: { status: 'DECLINED' },
            include: {
                proposedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Send decline email to the proposer (if someone else declined it)
        if (scheduledCall.proposedById !== user.id && scheduledCall.proposedBy.email) {
            await sendCallDeclinedEmail(scheduledCall.proposedBy.email, {
                title: scheduledCall.title || undefined,
                scheduledAt: scheduledCall.scheduledAt,
                duration: scheduledCall.duration,
                proposerName: scheduledCall.proposedBy.name || 'User',
                recipientName: user.name || 'User',
                startupTitle: relationship.startup.title,
            });
        }

        return NextResponse.json({
            message: 'Call declined',
            scheduledCall: updatedCall
        });
    } catch (error) {
        console.error('Error declining scheduled call:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
