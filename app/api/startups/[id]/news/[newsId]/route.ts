import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

interface Params {
    params: Promise<{ id: string; newsId: string }>;
}

// PUT - Update a news item (Innovator only)
export async function PUT(request: Request, { params }: Params) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id, newsId } = await params;
        const body = await request.json();
        const { title, content } = body;

        // Verify ownership via startup relation
        const news = await prisma.startupNews.findUnique({
            where: { id: newsId },
            include: { startup: true }
        });

        if (!news || news.startupId !== id) {
            return NextResponse.json(
                { error: 'News item not found' },
                { status: 404 }
            );
        }

        if (news.startup.innovatorId !== user.id) {
            return NextResponse.json(
                { error: 'Only the innovator can edit this update' },
                { status: 403 }
            );
        }

        const updatedNews = await prisma.startupNews.update({
            where: { id: newsId },
            data: {
                title: title !== undefined ? title : undefined,
                content: content !== undefined ? content : undefined,
            },
        });

        return NextResponse.json({ news: updatedNews });
    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a news item (Innovator only)
export async function DELETE(request: Request, { params }: Params) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id, newsId } = await params;

        // Verify ownership
        const news = await prisma.startupNews.findUnique({
            where: { id: newsId },
            include: { startup: true }
        });

        if (!news || news.startupId !== id) {
            return NextResponse.json(
                { error: 'News item not found' },
                { status: 404 }
            );
        }

        if (news.startup.innovatorId !== user.id) {
            return NextResponse.json(
                { error: 'Only the innovator can delete this update' },
                { status: 403 }
            );
        }

        await prisma.startupNews.delete({
            where: { id: newsId },
        });

        return NextResponse.json({ message: 'News item deleted' });
    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
