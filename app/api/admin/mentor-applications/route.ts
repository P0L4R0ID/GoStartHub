import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // Verify user is admin
        const isAdmin = await checkAdminAuth();

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Build query filter
        const where: any = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            where.status = status;
        }

        // Fetch applications with user details
        const applications = await prisma.mentorApplication.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        return NextResponse.json({ applications }, { status: 200 });

    } catch (error: any) {
        console.error('Fetch applications error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
