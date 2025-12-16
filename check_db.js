// Test script to check database contents
// Run with: node check_db.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('Checking database...\n');

        // Count all startups
        const totalStartups = await prisma.startup.count();
        console.log(`Total startups in database: ${totalStartups}`);

        // Get all startups with their status
        const allStartups = await prisma.startup.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true
            }
        });

        console.log('\nAll startups:');
        allStartups.forEach(s => {
            console.log(`- ${s.title} (status: ${s.status}, id: ${s.id})`);
        });

        // Check by status
        const statusCounts = await prisma.startup.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('\nStartups by status:');
        statusCounts.forEach(sc => {
            console.log(`- ${sc.status}: ${sc._count}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
