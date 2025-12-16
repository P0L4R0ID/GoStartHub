import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMentorSession, verifyUserSession } from '@/lib/auth-helpers';
import { sendCallConfirmedEmail } from '@/lib/email';

interface Params {
    params: Promise<{ relationshipId: string; callId: string }>;
}

// POST - Confirm a scheduled call
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

        // Only the other party (not the proposer) can confirm
        const relationship = scheduledCall.relationship;
        const isProposer = scheduledCall.proposedById === user.id;
        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        if (isProposer) {
            return NextResponse.json(
                { error: 'You cannot confirm your own proposed call. The other party must confirm.' },
                { status: 400 }
            );
        }

        // Update status to CONFIRMED
        const updatedCall = await prisma.scheduledCall.update({
            where: { id: callId },
            data: { status: 'CONFIRMED' },
            include: {
                proposedBy: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Send confirmation email to the proposer
        if (scheduledCall.proposedBy.email) {
            await sendCallConfirmedEmail(scheduledCall.proposedBy.email, {
                title: scheduledCall.title || undefined,
                scheduledAt: scheduledCall.scheduledAt,
                duration: scheduledCall.duration,
                proposerName: scheduledCall.proposedBy.name || 'User',
                recipientName: user.name || 'User',
                startupTitle: relationship.startup.title,
            });
        }

        return NextResponse.json({
            message: 'Call confirmed successfully',
            scheduledCall: updatedCall
        });
    } catch (error) {
        console.error('Error confirming scheduled call:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
