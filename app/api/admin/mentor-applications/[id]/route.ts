import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function DELETE(
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

        const { id: applicationId } = await params;

        // Find the application to get the user ID
        const application = await prisma.mentorApplication.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        const userId = application.userId;

        // Delete in order to respect foreign key constraints:
        // 1. Delete mentor profile if exists
        await prisma.mentorProfile.deleteMany({
            where: { userId }
        });

        // 2. Delete the application
        await prisma.mentorApplication.delete({
            where: { id: applicationId }
        });

        // 3. Reset user role to USER if they were a mentor
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' }
        });

        return NextResponse.json(
            { message: 'Mentor application and profile deleted successfully' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Delete mentor error:', error);

        return NextResponse.json(
            { error: 'Failed to delete mentor: ' + error.message },
            { status: 500 }
        );
    }
}
