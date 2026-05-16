import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const cookieStore = cookies();

        // Check for user ID cookie (set by login API)
        const userIdCookie = cookieStore.get('gostarthub_user_id');

        if (!userIdCookie) {
            return NextResponse.json(
                { role: null, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const userId = userIdCookie.value;

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                name: true,
                email: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { role: null, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            role: user.role,
            userId: user.id,
            name: user.name,
            email: user.email
        }, { status: 200 });

    } catch (error) {
        console.error('Get user role error:', error);
        return NextResponse.json(
            { role: null, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
