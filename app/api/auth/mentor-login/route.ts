import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: `User not found: ${email}` },
                { status: 401 }
            );
        }

        // Verify user has mentor role
        if (user.role !== 'mentor') {
            return NextResponse.json(
                { error: 'Access denied. This login is for mentors only.' },
                { status: 403 }
            );
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Password mismatch' },
                { status: 401 }
            );
        }

        // Set mentor session cookie
        const cookieStore = cookies();
        cookieStore.set('gostarthub_mentor_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Set user ID cookie for API access
        cookieStore.set('gostarthub_user_id', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            { message: 'Login successful', user: userWithoutPassword },
            { status: 200 }
        );
    } catch (error) {
        console.error('Mentor login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
