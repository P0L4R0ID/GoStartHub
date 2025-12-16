import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function verifyMentorSession() {
    // Use regular user session, just check for MENTOR role
    const cookieStore = cookies();
    const userId = cookieStore.get('gostarthub_user_id');

    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId.value },
    });

    if (!user || user.role !== 'MENTOR') {
        return null;
    }

    return user;
}

export async function verifyUserSession() {
    const cookieStore = cookies();
    const userId = cookieStore.get('gostarthub_user_id');

    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId.value },
    });

    return user;
}

export async function verifyAdminSession() {
    const cookieStore = cookies();
    const adminSession = cookieStore.get('gostarthub_admin_session');
    const userId = cookieStore.get('gostarthub_user_id');

    if (!adminSession || adminSession.value !== 'authenticated' || !userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId.value },
    });

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return user;
}

export async function getUserFromSession() {
    const cookieStore = cookies();
    const userId = cookieStore.get('gostarthub_user_id');

    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId.value },
    });

    return user;
}
