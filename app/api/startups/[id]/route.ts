import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';
import { verifyUserSession } from '@/lib/auth-helpers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const startup = await prisma.startup.findUnique({
            where: { id },
        });

        if (!startup) {
            return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
        }

        // Check for current user to determine ownership
        let isInnovator = false;
        try {
            const user = await verifyUserSession();
            if (user && user.id === startup.innovatorId) {
                isInnovator = true;
            }
        } catch (e) {
            // Ignore auth errors, public endpoint
        }

        // Parse teamMembers if stored as JSON string
        let teamMembers = [];
        try {
            teamMembers = JSON.parse(startup.teamMembers);
        } catch (e) {
            // Fallback or handle error
        }

        return NextResponse.json({
            ...startup,
            teamMembers,
            isInnovator
        });
    } catch (error) {
        console.error('Failed to fetch startup:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = params.id;

        await prisma.startup.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Startup deleted successfully' });
    } catch (error) {
        console.error('Failed to delete startup:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
