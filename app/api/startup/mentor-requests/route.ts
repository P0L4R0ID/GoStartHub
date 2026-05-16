import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

export async function GET(request: Request) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all startups owned by this user
        const userStartups = await prisma.startup.findMany({
            where: {
                innovatorId: user.id,
            },
            select: {
                id: true,
            },
        });

        const startupIds = userStartups.map(s => s.id);

        // Get all mentorship requests for user's startups
        const requests = await prisma.mentorshipRequest.findMany({
            where: {
                startupId: {
                    in: startupIds,
                },
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        bio: true,
                        company: true,
                        expertise: true,
                        linkedIn: true,
                    },
                },
                startup: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Error fetching startup mentor requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { mentorId, startupId, message } = body;

        if (!mentorId || !startupId) {
            return NextResponse.json(
                { error: 'Mentor ID and Startup ID are required' },
                { status: 400 }
            );
        }

        // Verify startup belongs to user
        const startup = await prisma.startup.findUnique({
            where: { id: startupId },
        });

        if (!startup || startup.innovatorId !== user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to request mentorship for this startup' },
                { status: 403 }
            );
        }

        // Verify mentor exists and has mentor role
        const mentor = await prisma.user.findUnique({
            where: { id: mentorId },
        });

        if (!mentor || mentor.role !== 'mentor') {
            return NextResponse.json(
                { error: 'Mentor not found' },
                { status: 404 }
            );
        }

        // Check if request already exists
        const existingRequest = await prisma.mentorshipRequest.findFirst({
            where: {
                mentorId: mentorId,
                startupId: startupId,
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'A mentorship request already exists for this mentor and startup' },
                { status: 400 }
            );
        }

        // Create mentorship request
        const mentorshipRequest = await prisma.mentorshipRequest.create({
            data: {
                mentorId: mentorId,
                startupId: startupId,
                initiatedBy: 'STARTUP',
                message: message || null,
                status: 'PENDING',
            },
            include: {
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        bio: true,
                        company: true,
                        expertise: true,
                    },
                },
                startup: true,
            },
        });

        return NextResponse.json(
            { message: 'Mentorship request sent successfully', request: mentorshipRequest },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating startup mentor request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
