import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

// DELETE - Delete a mentor account
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const mentorId = params.id;

        // Check if user exists and is a mentor
        const mentor = await prisma.user.findUnique({
            where: { id: mentorId },
        });

        if (!mentor) {
            return NextResponse.json(
                { error: 'Mentor not found' },
                { status: 404 }
            );
        }

        if (mentor.role !== 'MENTOR' && mentor.role !== 'mentor') {
            return NextResponse.json(
                { error: 'User is not a mentor' },
                { status: 400 }
            );
        }

        // Delete mentor profile first if it exists
        await prisma.mentorProfile.deleteMany({
            where: { userId: mentorId },
        });

        // Delete the user account
        await prisma.user.delete({
            where: { id: mentorId },
        });

        return NextResponse.json({
            message: 'Mentor deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting mentor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
