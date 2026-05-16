import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDoeFullProfile() {
    try {
        console.log('=== Verifying Full Profile for Doe Accounts ===\n');

        const doeUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: 'Doe', mode: 'insensitive' } },
                    { email: { contains: 'doe', mode: 'insensitive' } }
                ]
            },
            include: {
                startups: true,
                mentorshipsAsMentor: true,
                mentorRequestsSent: true,
                // Funding applications are not directly related in schema as a relation field on User in some versions, 
                // but let's check the schema. schema.prisma says:
                // FundingApplication has 'innovatorId' but no relation field on User model line 71-98.
                // So we query separately.
            }
        });

        console.log(`Found ${doeUsers.length} Doe Users:\n`);

        for (const user of doeUsers) {
            console.log(`--- User: ${user.name} (${user.email}) ID: ${user.id} ---`);

            // Check Startups
            console.log(`Startups (${user.startups.length}):`);
            user.startups.forEach(s => console.log(`  - ${s.title} (${s.status})`));

            // Check Mentorships
            // The user schema has 'mentorRequestsSent' and 'mentorshipsAsMentor'. 
            // But for an *innovator* (startup owner), they usually *receive* mentorship? 
            // Let's check MentorshipRequest where initiatedBy could be match.
            // Actually schema says:
            // model MentorshipRequest { mentorId (User), startupId (Startup) }
            // model MentorshipRelationship { mentorId (User), startupId (Startup) }
            // So the innovator is linked via the Startup, not directly the User (mostly).

            const startupIds = user.startups.map(s => s.id);

            const mentorships = await prisma.mentorshipRelationship.findMany({
                where: { startupId: { in: startupIds } },
                include: { mentor: true }
            });
            console.log(`Active Mentorships via Startups (${mentorships.length}):`);
            mentorships.forEach(m => console.log(`  - With ${m.mentor.name} (Status: ${m.status})`));

            const requests = await prisma.mentorshipRequest.findMany({
                where: { startupId: { in: startupIds } },
                include: { mentor: true }
            });
            console.log(`Mentorship Requests via Startups (${requests.length}):`);
            requests.forEach(r => console.log(`  - With ${r.mentor.name} (Status: ${r.status})`));

            // Check Funding Applications
            const fundingApps = await prisma.fundingApplication.findMany({
                where: { innovatorId: user.id }
            });
            console.log(`Funding Applications (${fundingApps.length}):`);
            fundingApps.forEach(a => console.log(`  - Application ID: ${a.id} (Status: ${a.status})`));

            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDoeFullProfile();
