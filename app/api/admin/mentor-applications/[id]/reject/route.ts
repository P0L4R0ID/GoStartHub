import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify user is admin
        const isAdmin = await checkAdminAuth();

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Parse request body for optional admin notes
        const body = await request.json().catch(() => ({}));
        const { adminNotes } = body;

        // Find the application
        const application = await prisma.mentorApplication.findUnique({
            where: { id }
        });

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        // Allow rejecting both PENDING and APPROVED applications

        // Use transaction to: reset user role, delete mentor profile, update application
        await prisma.$transaction(async (tx) => {
            // Reset user role to USER
            await tx.user.update({
                where: { id: application.userId },
                data: { role: 'USER' }
            });

            // Delete mentor profile if it exists
            await tx.mentorProfile.deleteMany({
                where: { userId: application.userId }
            });

            // Update application status to REJECTED
            await tx.mentorApplication.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    reviewedAt: new Date(),
                    adminNotes: adminNotes || null
                }
            });
        });

        return NextResponse.json(
            { message: 'Application rejected and mentor access revoked' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Reject application error:', error);

        return NextResponse.json(
            { error: 'Failed to reject application' },
            { status: 500 }
        );
    }
}
