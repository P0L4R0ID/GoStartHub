const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStartups() {
    const startups = await prisma.startup.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log('Recent Startups:');
    startups.forEach(s => {
        console.log(`- Title: ${s.title}, ID: ${s.id}, InnovatorID: ${s.innovatorId}, Status: ${s.status}`);
    });
}

checkStartups()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
