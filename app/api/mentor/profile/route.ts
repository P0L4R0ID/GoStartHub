import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMentor, requireAuth } from '@/lib/auth-utils';

export async function GET(request: Request) {
    try {
        // Get authenticated user ID
        const userId = await requireAuth();

        // Fetch mentor profile
        const profile = await prisma.mentorProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!profile) {
            return NextResponse.json(
                { error: 'Mentor profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ profile }, { status: 200 });

    } catch (error: any) {
        console.error('Get mentor profile error:', error);

        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        // Verify user is a mentor
        const userId = await requireMentor();

        // Parse request body
        const body = await request.json();
        const { name, bio, expertise, experience, company, availability, profileImage, socialLinks } = body;

        // Update user name if provided
        if (name) {
            await prisma.user.update({
                where: { id: userId },
                data: { name }
            });
        }

        // Update mentor profile
        const updatedProfile = await prisma.mentorProfile.update({
            where: { userId },
            data: {
                ...(bio && { bio }),
                ...(expertise && { expertise: typeof expertise === 'string' ? expertise : JSON.stringify(expertise) }),
                ...(experience && { experience }),
                ...(company !== undefined && { company }),
                ...(availability && { availability }),
                ...(profileImage !== undefined && { profileImage }),
                ...(socialLinks && { socialLinks: typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks) })
            }
        });

        return NextResponse.json(
            {
                message: 'Profile updated successfully',
                profile: updatedProfile
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Update mentor profile error:', error);

        if (error.message === 'Authentication required' || error.message === 'Mentor access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update profile: ' + error.message },
            { status: 500 }
        );
    }
}
