'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// This script will create an admin user or update an existing user to admin
// Run this once to set up your admin account

export async function createOrUpdateAdmin() {
    const adminEmail = 'admin@gostarthub.com';
    const adminPassword = 'admin123'; // Change this to your desired password

    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingUser) {
        // Update existing user to admin role
        const updated = await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'admin' }
        });
        return { message: `Updated ${updated.email} to admin role`, user: updated };
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
        return { message: `Created new admin user: ${newUser.email}`, user: newUser };
    }
}
