import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/setup-admin - Creates or updates admin user
// NOTE: This endpoint should be removed in production!
export async function GET() {
    const adminEmail = 'admin@gostarthub.com';
    const adminPassword = 'admin123'; // Default password - change after first login

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            // Update existing user to admin role
            const updated = await prisma.user.update({
                where: { email: adminEmail },
                data: { role: 'admin' }
            });
            return NextResponse.json({
                success: true,
                message: `Updated ${updated.email} to admin role`,
                note: 'You can now login with admin@gostarthub.com and your existing password'
            });
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const newUser = await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Admin',
                    role: 'admin'
                }
            });
            return NextResponse.json({
                success: true,
                message: `Created new admin user: ${newUser.email}`,
                note: 'Login with admin@gostarthub.com and password: admin123'
            });
        }
    } catch (error) {
        console.error('Setup admin error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to setup admin user'
        }, { status: 500 });
    }
}
