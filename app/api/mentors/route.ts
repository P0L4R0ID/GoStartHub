import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Disable Vercel edge caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        // Fetch all users with MENTOR role and their profiles
        const mentors = await prisma.user.findMany({
            where: {
                role: 'MENTOR'
            },
            select: {
                id: true,
                name: true,
                email: true,
                isDisabled: true,
                mentorProfile: {
                    select: {
                        bio: true,
                        expertise: true,
                        experience: true,
                        company: true,
                        availability: true,
                        profileImage: true,
                        socialLinks: true,
                        mentorType: true,
                        languages: true,
                        linkedin: true
                    }
                }
            }
        });

        // Filter out mentors without profiles (edge case)
        const validMentors = mentors.filter(m => m.mentorProfile);

        return NextResponse.json({ mentors: validMentors }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error: any) {
        console.error('Fetch mentors error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mentors' },
            { status: 500 }
        );
    }
}
