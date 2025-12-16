import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: startupId } = await params;
        const isAdmin = await checkAdminAuth();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if startup exists and is approved
        const startup = await prisma.startup.findUnique({
            where: { id: startupId },
        });

        if (!startup) {
            return NextResponse.json(
                { error: 'Startup not found' },
                { status: 404 }
            );
        }

        if (startup.status !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Only approved startups can be marked as finished' },
                { status: 400 }
            );
        }

        // Update startup status to FINISHED
        const updatedStartup = await prisma.startup.update({
            where: { id: startupId },
            data: { status: 'FINISHED' },
        });

        return NextResponse.json({
            message: 'Startup marked as finished',
            startup: updatedStartup,
        });
    } catch (error) {
        console.error('Error marking startup as finished:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
