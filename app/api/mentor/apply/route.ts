import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// Force dynamic for Vercel
export const dynamic = 'force-dynamic';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function POST(request: Request) {
    try {
        // Authenticate user
        const userId = await requireAuth();

        let formData;
        try {
            formData = await request.formData();
        } catch (formError: any) {
            console.error('FormData parsing error:', formError);
            return NextResponse.json(
                { error: 'Failed to parse form data: ' + formError.message },
                { status: 400 }
            );
        }

        // Extract text fields
        const bio = formData.get('bio') as string;
        const expertise = formData.get('expertise') as string;
        const experience = formData.get('experience') as string;
        const portfolioUrl = formData.get('portfolioUrl') as string | null;
        const company = formData.get('company') as string | null;
        const availability = formData.get('availability') as string | null;
        const mentorType = formData.get('mentorType') as string | null;
        const mentorTypeOther = formData.get('mentorTypeOther') as string | null;
        const languages = formData.get('languages') as string;
        const linkedinUrl = formData.get('linkedinUrl') as string | null;

        // Extract file
        const profileImageFile = formData.get('profileImage') as File | null;

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

        // Handle profile image - convert to base64 data URL for Vercel compatibility
        let profileImageData: string | null = null;
        if (profileImageFile && profileImageFile.size > 0) {
            const bytes = await profileImageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const mimeType = profileImageFile.type || 'image/jpeg';
            profileImageData = `data:${mimeType};base64,${base64}`;
        }

        // Create mentor application
        const finalMentorType = mentorType === 'other' ? mentorTypeOther : mentorType;
        const application = await prisma.mentorApplication.create({
            data: {
                userId,
                bio,
                expertise: expertise,
                experience,
                portfolioUrl: portfolioUrl || null,
                company: company || null,
                availability: availability || null,
                mentorType: finalMentorType || null,
                languages: languages,
                linkedin: linkedinUrl || null,
                profileImage: profileImageData,
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
