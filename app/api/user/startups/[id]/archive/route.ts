import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserSession } from '@/lib/auth-helpers';

// POST - Archive user's own startup
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await verifyUserSession();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const startupId = params.id;

        // Check if startup exists and belongs to this user
        const startup = await prisma.startup.findUnique({
            where: { id: startupId },
        });

        if (!startup) {
            return NextResponse.json(
                { error: 'Startup not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (startup.innovatorId !== user.id) {
            return NextResponse.json(
                { error: 'You can only archive your own startups' },
                { status: 403 }
            );
        }

        // Only approved startups can be archived
        if (startup.status !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Only approved startups can be archived' },
                { status: 400 }
            );
        }

        // Update startup status to ARCHIVED
        const updatedStartup = await prisma.startup.update({
            where: { id: startupId },
            data: { status: 'ARCHIVED' },
        });

        return NextResponse.json({
            message: 'Startup archived successfully',
            startup: updatedStartup,
        });
    } catch (error) {
        console.error('Error archiving startup:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
