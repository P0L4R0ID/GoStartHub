import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMentorSession, verifyUserSession } from '@/lib/auth-helpers';

interface Params {
    params: Promise<{ relationshipId: string }>;
}

export async function GET(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId } = await params;

        // Verify user has access to this relationship
        const relationship = await prisma.mentorshipRelationship.findUnique({
            where: { id: relationshipId },
            include: {
                startup: true,
            },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Relationship not found' },
                { status: 404 }
            );
        }

        // Check if user is either the mentor or the startup owner
        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Get messages
        const messages = await prisma.sessionMessage.findMany({
            where: {
                relationshipId: relationshipId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching session messages:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request, { params }: Params) {
    try {
        const user = await verifyMentorSession() || await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { relationshipId } = await params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim() === '') {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Verify user has access to this relationship
        const relationship = await prisma.mentorshipRelationship.findUnique({
            where: { id: relationshipId },
            include: {
                startup: true,
            },
        });

        if (!relationship) {
            return NextResponse.json(
                { error: 'Relationship not found' },
                { status: 404 }
            );
        }

        const hasAccess = relationship.mentorId === user.id || relationship.startup.innovatorId === user.id;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'You do not have access to this session' },
                { status: 403 }
            );
        }

        // Create message
        const message = await prisma.sessionMessage.create({
            data: {
                relationshipId: relationshipId,
                senderId: user.id,
                content: content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
