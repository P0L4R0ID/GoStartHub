import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendCallReminderEmail } from '@/lib/email';

// This endpoint should be called periodically (e.g., every 15 minutes via cron job)
// It finds confirmed calls starting within the next hour and sends reminder emails

export async function GET(request: Request) {
    try {
        // Optional: Add a secret key check for security
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // If CRON_SECRET is set, validate it
        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

        // Find confirmed calls scheduled within the next 30-60 minutes that haven't had reminders sent
        const upcomingCalls = await prisma.scheduledCall.findMany({
            where: {
                status: 'CONFIRMED',
                reminderSent: false,
                scheduledAt: {
                    gte: thirtyMinutesFromNow,
                    lte: oneHourFromNow,
                },
            },
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
                    }
                },
                proposedBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        let emailsSent = 0;

        for (const call of upcomingCalls) {
            const startup = call.relationship.startup;
            const mentor = call.relationship.mentor;
            const innovator = startup.innovator;

            const callDetails = {
                title: call.title || undefined,
                scheduledAt: call.scheduledAt,
                duration: call.duration,
                proposerName: call.proposedBy.name || 'User',
                recipientName: 'User',
                startupTitle: startup.title,
            };

            // Send reminder to mentor
            if (mentor.email) {
                await sendCallReminderEmail(
                    mentor.email,
                    mentor.name || 'Mentor',
                    innovator?.name || 'Innovator',
                    callDetails
                );
                emailsSent++;
            }

            // Send reminder to innovator
            if (innovator?.email) {
                await sendCallReminderEmail(
                    innovator.email,
                    innovator.name || 'Innovator',
                    mentor.name || 'Mentor',
                    callDetails
                );
                emailsSent++;
            }

            // Mark reminder as sent
            await prisma.scheduledCall.update({
                where: { id: call.id },
                data: { reminderSent: true }
            });
        }

        return NextResponse.json({
            message: `Processed ${upcomingCalls.length} calls, sent ${emailsSent} reminder emails`,
            callsProcessed: upcomingCalls.length,
            emailsSent
        });

    } catch (error) {
        console.error('Error sending reminder emails:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
