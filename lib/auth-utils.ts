import { cookies } from 'next/headers';
import { prisma } from './prisma';

/**
 * Get user ID from authentication cookies
 */
export async function getUserIdFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    const userId = cookieStore.get('gostarthub_user_id')?.value;
    return userId || null;
}

/**
 * Get user with role from database
 */
export async function getUserWithRole(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });
}

/**
 * Check if user is authenticated (has valid session)
 */
export async function requireAuth(): Promise<string> {
    const userId = await getUserIdFromCookies();
    if (!userId) {
        throw new Error('Authentication required');
    }
    return userId;
}

/**
 * Check if user has ADMIN role
 */
export async function requireAdmin(): Promise<string> {
    const userId = await requireAuth();
    const user = await getUserWithRole(userId);

    if (!user || user.role !== 'ADMIN') {
        throw new Error('Admin access required');
    }

    return userId;
}

/**
 * Check if user has MENTOR role
 */
export async function requireMentor(): Promise<string> {
    const userId = await requireAuth();
    const user = await getUserWithRole(userId);

    if (!user || user.role !== 'MENTOR') {
        throw new Error('Mentor access required');
    }

    return userId;
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<string | null> {
    const user = await getUserWithRole(userId);
    return user?.role || null;
}
