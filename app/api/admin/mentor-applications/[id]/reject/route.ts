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

        if (application.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Application has already been reviewed' },
                { status: 400 }
            );
        }

        // Update application status to REJECTED
        await prisma.mentorApplication.update({
            where: { id },
            data: {
                status: 'REJECTED',
                reviewedAt: new Date(),
                adminNotes: adminNotes || null
            }
        });

        return NextResponse.json(
            { message: 'Application rejected' },
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
