import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all users with mentor role (handle both cases)
        const mentors = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'mentor' },
                    { role: 'MENTOR' },
                ],
            },
            select: {
                id: true,
                email: true,
                name: true,
                bio: true,
                company: true,
                expertise: true,
                linkedIn: true,
                isDisabled: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        mentorshipsAsMentor: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ mentors });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Update user role to mentor
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                role: 'mentor',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return NextResponse.json({
            message: 'User approved as mentor',
            user,
        });
    } catch (error) {
        console.error('Error approving mentor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
