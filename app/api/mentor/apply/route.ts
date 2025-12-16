import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const userId = await requireAuth();

        const formData = await request.formData();

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

        // Handle profile image upload
        let profileImagePath: string | null = null;
        if (profileImageFile && profileImageFile.size > 0) {
            const bytes = await profileImageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const ext = path.extname(profileImageFile.name) || '.jpg';
            const filename = `mentor-${userId}-${Date.now()}${ext}`;

            // Ensure upload directory exists
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'mentors');
            await mkdir(uploadDir, { recursive: true });

            // Save file
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);

            // Store relative path for web access
            profileImagePath = `/uploads/mentors/${filename}`;
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
                profileImage: profileImagePath,
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
