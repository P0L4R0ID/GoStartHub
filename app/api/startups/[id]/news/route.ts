import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

interface Params {
    params: Promise<{ id: string }>;
}

// GET - Fetch all news for a startup (Public)
export async function GET(request: Request, { params }: Params) {
    try {
        const { id } = await params;

        const news = await prisma.startupNews.findMany({
            where: { startupId: id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ news });
    } catch (error) {
        console.error('Error fetching startup news:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create a news update (Innovator only)
export async function POST(request: Request, { params }: Params) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        // Verify startup ownership
        const startup = await prisma.startup.findUnique({
            where: { id },
            select: { innovatorId: true },
        });

        if (!startup) {
            return NextResponse.json(
                { error: 'Startup not found' },
                { status: 404 }
            );
        }

        if (startup.innovatorId !== user.id) {
            return NextResponse.json(
                { error: 'Only the innovator can post updates for this startup' },
                { status: 403 }
            );
        }

        // Create news
        const news = await prisma.startupNews.create({
            data: {
                startupId: id,
                title,
                content,
            },
        });

        return NextResponse.json({ news }, { status: 201 });
    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
