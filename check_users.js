const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany();
    console.log('Users:', users);

    // Find or create admin
    let admin = users.find(u => u.role === 'admin');
    if (!admin) {
        console.log('No admin found. Promoting test@example.com to admin...');
        const testUser = users.find(u => u.email === 'test@example.com');
        if (testUser) {
            admin = await prisma.user.update({
                where: { id: testUser.id },
                data: { role: 'admin' }
            });
            console.log('Promoted test@example.com to admin');
        } else {
            console.log('test@example.com not found. Please create it first.');
        }
    } else {
        console.log('Admin found:', admin.email);
    }
}

checkUsers()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
