import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateDoeApplications() {
    try {
        console.log('=== Investigating Doe Funding Applications ===\n');

        // Search by innovatorName field (case-insensitive)
        const appsByName = await prisma.fundingApplication.findMany({
            where: {
                innovatorName: { contains: 'Doe', mode: 'insensitive' }
            },
            select: {
                id: true,
                innovatorId: true,
                innovatorName: true,
                innovatorEmail: true,
                status: true,
                createdAt: true,
                opportunityId: true
            }
        });

        console.log(`Found ${appsByName.length} applications by innovatorName:`);
        appsByName.forEach(app => {
            console.log(`  - ID: ${app.id}`);
            console.log(`    Name: ${app.innovatorName}`);
            console.log(`    Email: ${app.innovatorEmail}`);
            console.log(`    Status: ${app.status}`);
            console.log(`    InnovatorId: ${app.innovatorId}`);
            console.log('');
        });

        // Search by innovatorEmail field
        const appsByEmail = await prisma.fundingApplication.findMany({
            where: {
                innovatorEmail: { contains: 'doe', mode: 'insensitive' }
            },
            select: {
                id: true,
                innovatorId: true,
                innovatorName: true,
                innovatorEmail: true,
                status: true,
                createdAt: true
            }
        });

        console.log(`\nFound ${appsByEmail.length} applications by innovatorEmail:`);
        appsByEmail.forEach(app => {
            console.log(`  - ID: ${app.id}`);
            console.log(`    Name: ${app.innovatorName}`);
            console.log(`    Email: ${app.innovatorEmail}`);
            console.log(`    Status: ${app.status}`);
            console.log('');
        });

        // Get ALL funding applications to see what's there
        const allApps = await prisma.fundingApplication.findMany({
            select: {
                id: true,
                innovatorId: true,
                innovatorName: true,
                innovatorEmail: true,
                status: true
            }
        });

        console.log(`\n=== ALL Funding Applications (${allApps.length} total) ===`);
        allApps.forEach(app => {
            console.log(`${app.innovatorName} (${app.innovatorEmail}) - ${app.status}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

investigateDoeApplications();
