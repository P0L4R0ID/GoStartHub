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

        // Block admin from logging in via regular login page
        const ADMIN_EMAIL = 'admin@gostarthub.com';
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            return NextResponse.json(
                { error: 'error' },
                { status: 403 }
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

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Password mismatch' },
                { status: 401 }
            );
        }

        // Set session cookie
        // Set session cookie
        const cookieStore = cookies();
        if (user.role === 'admin') {
            cookieStore.set('gostarthub_admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
        }

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
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
