import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDoeApplications() {
    try {
        // Find users with "Doe" in their name or email
        const doeUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: 'Doe', mode: 'insensitive' } },
                    { email: { contains: 'doe', mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        console.log('Found users with "Doe":', doeUsers);

        if (doeUsers.length === 0) {
            console.log('No users found with "Doe" in name or email');
            return;
        }

        // Get all funding applications for these users
        const userIds = doeUsers.map(u => u.id);

        const applications = await prisma.fundingApplication.findMany({
            where: {
                innovatorId: { in: userIds }
            },
            select: {
                id: true,
                innovatorName: true,
                innovatorEmail: true,
                status: true,
                createdAt: true
            }
        });

        console.log(`\nFound ${applications.length} funding applications for Doe users:`);
        applications.forEach(app => {
            console.log(`- ID: ${app.id}, Name: ${app.innovatorName}, Email: ${app.innovatorEmail}, Status: ${app.status}`);
        });

        // Delete the applications
        if (applications.length > 0) {
            const result = await prisma.fundingApplication.deleteMany({
                where: {
                    innovatorId: { in: userIds }
                }
            });

            console.log(`\n✅ Successfully deleted ${result.count} funding applications for Doe users`);
        } else {
            console.log('\nNo funding applications to delete');
        }

    } catch (error) {
        console.error('Error deleting funding applications:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteDoeApplications();
