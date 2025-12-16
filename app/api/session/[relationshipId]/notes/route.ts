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

        // Verify user has access
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

        // Get notes
        const notes = await prisma.sessionNote.findMany({
            where: {
                relationshipId: relationshipId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error('Error fetching session notes:', error);
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
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Verify user has access
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

        // Create note
        const note = await prisma.sessionNote.create({
            data: {
                relationshipId: relationshipId,
                authorId: user.id,
                title: title,
                content: content,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ note }, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: Params) {
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
        const { noteId, title, content } = body;

        if (!noteId || !title || !content) {
            return NextResponse.json(
                { error: 'Note ID, title and content are required' },
                { status: 400 }
            );
        }

        // Verify note exists and user is the author
        const note = await prisma.sessionNote.findUnique({
            where: { id: noteId },
        });

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        if (note.authorId !== user.id) {
            return NextResponse.json(
                { error: 'You can only edit your own notes' },
                { status: 403 }
            );
        }

        // Update note
        const updatedNote = await prisma.sessionNote.update({
            where: { id: noteId },
            data: {
                title: title,
                content: content,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ note: updatedNote });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
