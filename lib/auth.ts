import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'gostarthub_admin_session';


export async function checkAdminAuth() {
    const cookieStore = cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME);
    return session?.value === 'authenticated';
}

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function loginAdmin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    // Hardcoded admin credentials for quick access
    const ADMIN_EMAIL = 'admin@gostarthub.com';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const cookieStore = cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return {
            success: true,
            user: {
                id: 'admin-hardcoded',
                email: ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin',
            }
        };
    }

    // Fallback to database check for other admin users
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        if (user.role !== 'admin') {
            return { success: false, error: 'Unauthorized: Admin access only' };
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return { success: false, error: 'Invalid email or password' };
        }

        const cookieStore = cookies();
        // Set cookie for server-side auth
        cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        // Return user data to be stored in localStorage on client
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An error occurred during login' };
    }
}

export async function logoutAdmin() {
    const cookieStore = cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
}
