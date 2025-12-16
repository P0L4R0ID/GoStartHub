import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

// POST - Toggle mentor disabled status
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: mentorId } = await params;
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

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

        // Toggle the disabled status
        const updatedMentor = await prisma.user.update({
            where: { id: mentorId },
            data: { isDisabled: !mentor.isDisabled },
            select: {
                id: true,
                name: true,
                email: true,
                isDisabled: true,
            },
        });

        const action = updatedMentor.isDisabled ? 'disabled' : 'enabled';
        return NextResponse.json({
            message: `Mentor ${action} successfully`,
            mentor: updatedMentor,
        });
    } catch (error) {
        console.error('Error toggling mentor status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
