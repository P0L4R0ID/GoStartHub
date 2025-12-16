import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const userId = await requireAuth();

        const body = await request.json();
        const { bio, expertise, experience, portfolioUrl, company, availability, mentorType, mentorTypeOther, languages, linkedinUrl } = body;

        // Validate required fields
        if (!bio || !expertise || !experience) {
            return NextResponse.json(
                { error: 'Bio, expertise, and experience are required' },
                { status: 400 }
            );
        }

        // Check if user already has a pending or approved application
        const existingApplication = await prisma.mentorApplication.findFirst({
            where: {
                userId,
                status: {
                    in: ['PENDING', 'APPROVED']
                }
            }
        });

        if (existingApplication) {
            const message = existingApplication.status === 'APPROVED'
                ? 'You are already an approved mentor'
                : 'You already have a pending application';

            return NextResponse.json(
                { error: message },
                { status: 400 }
            );
        }

        // Create mentor application
        const finalMentorType = mentorType === 'other' ? mentorTypeOther : mentorType;
        const application = await prisma.mentorApplication.create({
            data: {
                userId,
                bio,
                expertise: typeof expertise === 'string' ? expertise : JSON.stringify(expertise),
                experience,
                portfolioUrl: portfolioUrl || null,
                company: company || null,
                availability: availability || null,
                mentorType: finalMentorType || null,
                languages: typeof languages === 'string' ? languages : JSON.stringify(languages),
                linkedin: linkedinUrl || null,
                status: 'PENDING'
            }
        });

        return NextResponse.json(
            {
                message: 'Your mentor application has been submitted successfully and is pending review.',
                applicationId: application.id
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Mentor application error:', error);

        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Please log in to apply as a mentor' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to submit application: ' + error.message },
            { status: 500 }
        );
    }
}
