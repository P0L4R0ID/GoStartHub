import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify user is admin
        const isAdmin = await checkAdminAuth();

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        const { id } = await params;


        // Find the application
        const application = await prisma.mentorApplication.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        if (application.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Application has already been reviewed' },
                { status: 400 }
            );
        }

        // Start transaction: update user role, create mentor profile, update application
        await prisma.$transaction(async (tx) => {
            // Update user role to MENTOR
            await tx.user.update({
                where: { id: application.userId },
                data: { role: 'MENTOR' }
            });


            // Create or update mentor profile from application data
            await tx.mentorProfile.upsert({
                where: { userId: application.userId },
                update: {
                    bio: application.bio,
                    expertise: application.expertise,
                    experience: application.experience,
                    company: application.company,
                    availability: application.availability || 'available',
                    mentorType: application.mentorType || null,
                    languages: application.languages || null,
                    linkedin: application.linkedin || null
                },
                create: {
                    userId: application.userId,
                    bio: application.bio,
                    expertise: application.expertise,
                    experience: application.experience,
                    company: application.company,
                    availability: application.availability || 'available',
                    profileImage: null,
                    socialLinks: null,
                    mentorType: application.mentorType || null,
                    languages: application.languages || null,
                    linkedin: application.linkedin || null
                }
            });

            // Update application status
            await tx.mentorApplication.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    reviewedAt: new Date()
                }
            });
        });

        return NextResponse.json(
            { message: 'Application approved successfully' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Approve application error:', error);

        return NextResponse.json(
            { error: 'Failed to approve application: ' + error.message },
            { status: 500 }
        );
    }
}
