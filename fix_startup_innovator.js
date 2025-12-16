// fix_startup_innovator.js
// Run with: node fix_startup_innovator.js <startup_title> <user_email>

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStartupInnovator() {
    const startupTitle = process.argv[2];
    const userEmail = process.argv[3];

    if (!startupTitle || !userEmail) {
        console.log('Usage: node fix_startup_innovator.js "<startup_title>" "<user_email>"');
        console.log('Example: node fix_startup_innovator.js "Eco World" "doe@example.com"');

        // List all startups with their innovatorId status
        console.log('\n--- All Startups ---');
        const startups = await prisma.startup.findMany({
            select: { id: true, title: true, innovatorId: true }
        });
        startups.forEach(s => {
            console.log(`${s.title}: innovatorId = ${s.innovatorId || 'NULL'}`);
        });

        // List all users
        console.log('\n--- All Users ---');
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true }
        });
        users.forEach(u => {
            console.log(`${u.email} (${u.name || 'No name'}) - Role: ${u.role}, ID: ${u.id}`);
        });

        // List active mentorship relationships
        console.log('\n--- Active Mentorship Relationships ---');
        const relationships = await prisma.mentorshipRelationship.findMany({
            where: { status: 'ACTIVE' },
            include: {
                startup: { select: { id: true, title: true, innovatorId: true } },
                mentor: { select: { id: true, name: true, email: true } }
            }
        });
        relationships.forEach(r => {
            console.log(`Startup: ${r.startup.title} (innovatorId: ${r.startup.innovatorId || 'NULL'})`);
            console.log(`  Mentor: ${r.mentor.name} (${r.mentor.email})`);
            console.log(`  Status: ${r.status}`);
        });

        await prisma.$disconnect();
        return;
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: { email: userEmail }
    });

    if (!user) {
        console.log(`User not found: ${userEmail}`);
        await prisma.$disconnect();
        return;
    }

    // Find startup
    const startup = await prisma.startup.findFirst({
        where: { title: startupTitle }
    });

    if (!startup) {
        console.log(`Startup not found: ${startupTitle}`);
        await prisma.$disconnect();
        return;
    }

    console.log(`Found startup: ${startup.title} (ID: ${startup.id})`);
    console.log(`Current innovatorId: ${startup.innovatorId || 'NULL'}`);
    console.log(`User ID: ${user.id}`);

    if (startup.innovatorId === user.id) {
        console.log('innovatorId is already correct!');
        await prisma.$disconnect();
        return;
    }

    // Update startup
    const updated = await prisma.startup.update({
        where: { id: startup.id },
        data: { innovatorId: user.id }
    });

    console.log(`Updated startup innovatorId to: ${updated.innovatorId}`);
    await prisma.$disconnect();
}

fixStartupInnovator().catch(console.error);
