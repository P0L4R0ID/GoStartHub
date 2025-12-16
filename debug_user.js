const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users in database...');
    const users = await prisma.user.findMany();
    console.log('Found users:', users);

    if (users.length > 0) {
        const user = users[0];
        console.log(`Testing password for user: ${user.email}`);
        const testPassword = 'password123';
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`Password '${testPassword}' valid?`, isValid);

        // Test hashing
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('New hash for password123:', newHash);
        console.log('Stored hash:', user.password);
    } else {
        console.log('No users found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
